const  GreetingDTO = require('../../Application/DTOs/Greeting/GreetingDTO');
const RepositoryFactory = require('../../Infrastructure/Persistence/Factory/RepositoryFactory');
const GreetingUseCase = require('../../Application/UseCases/GreetingUseCase');
const greetingRepo = RepositoryFactory.greeting();
class GreetingController {
    constructor(rabbitService) {
        this.greetingUseCase = new GreetingUseCase(greetingRepo,rabbitService);
    }
    createGreeting = async (req, res) => {
        try {
            const dto = new GreetingDTO(req.body);    
            const greeting = await this.greetingUseCase.createGreeting(dto);
            res.status(201).json(greeting);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }   
    }
    getGreetingById = async (req, res) => {
        try {
            const greeting = await this.greetingUseCase.getGreetingById(req.params.id);
            if (!greeting) {
                return res.status(404).json({ error: 'Greeting not found' });
            }       
            res.json(greeting);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    getAllGreetings = async (req, res) => {
        try {
            const greetings = await this.greetingUseCase.getAllGreetings(); 
            res.json(greetings);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    updateGreeting = async (req, res) => {
        try {
            const updatedGreeting = await this.greetingUseCase.updateGreeting(req.params.id, req.body);
            if (!updatedGreeting) {
                return res.status(404).json({ error: 'Greeting not found' });
            }
            res.json(updatedGreeting);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    deleteGreeting = async (req, res) => {
        try {
            const deleted = await this.greetingUseCase.deleteGreeting(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Greeting not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }   
    }
}
module.exports = GreetingController;