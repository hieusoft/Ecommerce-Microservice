const FlowerUseCase = require('../../Application/UseCases/FlowerUseCase');
const FlowerDTO = require('../../Application/DTOs/Flower/FlowerDTO');
const RepositoryFactory = require('../../Infrastructure/Persistence/Factory/RepositoryFactory');

const flowerRepo = RepositoryFactory.flower();
class FlowerController {
    constructor() {
        this.flowerUseCase = new FlowerUseCase(flowerRepo);
    }
    createFlower = async (req, res) => {
        try {
            const dto = new FlowerDTO(req.body);    
            const flower = await this.flowerUseCase.createFlower(dto);
            res.status(201).json(flower);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }   
    }

    getFlowerById = async (req, res) => {       
        try {
            const flower = await this.flowerUseCase.getFlowerById(req.params.id);
            if (!flower) {
                return res.status(404).json({ error: 'Flower not found' });
            }
            res.json(flower);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    getAllFlowers = async (req, res) => {
        try {
            const flowers = await this.flowerUseCase.getAllFlowers();
            console.log('Flowers:', JSON.stringify(flowers));
            res.json(flowers);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    updateFlower = async (req, res) => {
        try {
            const updatedFlower = await this.flowerUseCase.updateFlower(req.params.id, req.body);
            if (!updatedFlower) {
                return res.status(404).json({ error: 'Flower not found' });
            }
            res.json(updatedFlower);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }   
    }   
    deleteFlower = async (req, res) => {
        try {
            const deleted = await this.flowerUseCase.deleteFlower(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Flower not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}   
module.exports = FlowerController;