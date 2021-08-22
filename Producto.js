const db = require('./db/db')

class Producto {
    constructor(){

    }
    async guardar(producto){
       await  db.insert(producto).into('productos')
       const productos = await db.select('*').from('productos')
       let productosParse =  JSON.parse(JSON.stringify(productos))
       return productosParse
    }
    async listar(){
        const productos = await db.select('*').from('productos')
        let productosParse =  JSON.parse(JSON.stringify(productos))
        return productosParse
    }
    async buscarPorId(id){
        const producto = await db.select('*').from('productos').where('id', id)
        let productoParse =  JSON.parse(JSON.stringify(producto))
        return productoParse
    }
    async eliminar(id){
       await db('productos').where('id', id).del()
        const productos = await db.select('*').from('productos')
        let productosParse =  JSON.parse(JSON.stringify(productos))
        return productosParse
    }
    async editar(id, {title, price, description}){
        await db('productos').update({title, price:parseInt(price), description}).where('id', id)
        const productos = await db.select('*').from('productos')
        let productosParse =  JSON.parse(JSON.stringify(productos))
        return productosParse
    }
}
module.exports = Producto;