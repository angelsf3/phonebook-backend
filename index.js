require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(cors())

app.use(express.json())

app.use(morgan((tokens, request, response) => {
    return `${request.method} ${request.url} ${response.statusCode} ${JSON.stringify(request.body)}`
}))

app.use(express.static('build'))

let persons = []

app.get('/api/persons', (request, response) => {
    Person.find({}).then(p => {
        persons = p
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id

    Person.findById(id)
        .then(person => {
            response.json(person)
        })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id

    Person.findByIdAndRemove(id)
        .then(result => {
            response.status(204).end()
        })
})

app.get('/info', (request, response) => {
    const today = new Date()
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${today}</p>`
    )
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (body.name === undefined || body.number === undefined) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    else if (persons.find(person => person.name.includes(body.name))) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    else {
        const person = new Person({
            name: body.name,
            number: body.number
        })
        person.save().then(savedPerson => {
            response.json(savedPerson)
            persons = persons.concat(savedPerson)
        })
    }
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
