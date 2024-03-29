// require modules

const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()

// set db string connection 

let db,
    dbConnectionStr = process.env.DB_CONNECTION,
    dbName = 'todo'


async function connectToDatabaseAndStartServer(){
    try {
        const client = await MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)

        app.listen(process.env.PORT || PORT, ()=>{
            console.log(process.env.PORT)
            console.log(`Server running on port ${PORT}`)
        })

    } catch(error) {
        console.log('Error connecting to db and port')
        console.log(error)
    }
}

// Call the function to connect to the database and start the server
connectToDatabaseAndStartServer()

    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())



app.get('/', async (request, response) => {
    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
})



app.post('/addTodo', async (request, response) => {
    await db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    console.log('Todo Added')
    response.redirect('/')
})


app.delete('/deleteItem', async (request, response) => {
    await db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    console.log('Todo deleted')
    response.json('Todo deleted')

})

app.put('/markComplete', async (request, response) => {
    await db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })

    console.log('Marked Complete')
    response.json('Marked Complete')

})


app.put('/markUnComplete', async (request, response) => {
    await db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })

    console.log('Marked Completed')
    response.json('Marked Completed')


})