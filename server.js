"use strict";
exports.__esModule = true;
var express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var hbs = require("express-handlebars");
var Producto = require("./Producto.js");
const db = require('./db/db')
var routerProductos = express.Router();
var PORT = 8080;
var arrayConectados = [];

//configuracion de handlebars
app.engine("hbs", hbs({
    extname: "hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials/"
}));
app.set("views", "./views");
app.set("view engine", "hbs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(__dirname + '/public'));
app.use("/api/productos/", routerProductos);
var prod = new Producto();
routerProductos.get("/listar", function (req, res) {
    var data = prod.listar();
    data
        .then(resp => {
            res.json(resp.length !== 0
                ? { productos: resp }
                : { error: "no hay productos cargados" });
        })
});
app.get("/productos/vista", function (req, res) {
    var data = prod.listar();
    data
        .then(resp => {
            console.log('RESP',resp)
        res.render("main", resp.length !== 0
        ? { productos: resp }
        : { error: "no hay productos cargados" });
    })
  
});
app.get("/", function (req, res) {
    res.render("crearProducto", { 'products list': prod.listar() });
});
routerProductos.get("/listar/:id", function (req, res) {
    var result = prod.buscarPorId(parseInt(req.params.id));
    result.then(resp => {
        res.json(resp ? { producto: resp } : { error: "producto no encontrado" });
    })
    
});
routerProductos.post("/guardar/", function (req, res) {
    var producto = req.body;
    var guardado = prod.guardar(producto);
    console.log(guardado);
    res.redirect("/productos/vista");
});
routerProductos.put("/actualizar/:id", function (req, res) {
    var producto = req.body;
    var result = prod.editar(parseInt(req.params.id), producto);
    res.json(result);
});
routerProductos.delete("/borrar/:id", function (req, res) {
    var result = prod.eliminar(parseInt(req.params.id));
    res.json(result);
});

/**
 * 
 * sockets
 * 
*/


io.on('connect', async function  (socket) {
    let data = await prod.listar()
   
    io.sockets.emit('productData', { products: data });
    
    let mensajes = await db.select('*').from('mensajes')
    io.sockets.emit('crearMensaje', mensajes);

    

    socket.on('addNewProduct', function (data) {
        prod.guardar(data);
        let datas = prod.listar()
        datas.then(resp => {
            io.sockets.emit('productData', { products: resp });
        })
    });

    socket.on('deleteProduct',(id) => {
        prod.eliminar(id);
        let data = prod.listar()
        data.then(resp => {
            io.sockets.emit('productData', { products: resp });
        })
    })

    socket.on('editProduct', ({id, data}) => {
        prod.editar(id, data)
        console.log(id, data)
        let datas = prod.listar()
        datas.then(resp => {
            io.sockets.emit('productData', { products: resp });
        })
    })


    socket.on("disconnect", function (usuario) {
        socket.broadcast.emit('crearMensaje', { usuario: "Admin", mensaje: "Un usuario se fue", fecha: new Date() });
    });
    socket.on("entrarChat", function (usuario, callback) {
        usuario.id = socket.id;
        arrayConectados.push(usuario);
        callback(arrayConectados);
    });
    socket.on("crearMensaje", async function (mensaje, callback) {
        //socket.broadcast.emit('crearMensaje', mensaje)
        await  db.insert(mensaje).into('mensajes')
        mensajes.push(mensaje);
        io.sockets.emit('crearMensaje', mensajes);
    });
    socket.on("escribiendo", function (data, callback) {
        socket.broadcast.emit('escribiendo', data);
    });
});


server.listen(PORT, function () {
    console.log("servidor corriendo en en http://localhost:" + PORT);
});
server.on("error", function (error) { return console.log("error en el servidor " + error); });
