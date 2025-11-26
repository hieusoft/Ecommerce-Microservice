const OccasionDTO = require('../../Application/DTOs/Occasion/OccasionDTO');
const RepositoryFactory = require('../../Infrastructure/Persistence/Factory/RepositoryFactory');
const OccasionUseCase = require('../../Application/UseCases/OccasionUseCase');
const occasionRepo = RepositoryFactory.occasion();
class OccasionController {
    constructor(rabbitService) {
        this.occasionUseCase = new OccasionUseCase(occasionRepo,rabbitService);
    }

    createOccasion = async (req, res) => {
        try {
            const dto = new OccasionDTO(req.body);    
            const occasion = await this.occasionUseCase.createOccasion(dto);
            res.status(201).json(occasion);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    getOccasionById = async (req, res) => {
        try {
            const occasion = await this.occasionUseCase.getOccasionById(req.params.id); 
            if (!occasion) {
                return res.status(404).json({ error: 'Occasion not found' });
            }   
            res.json(occasion);

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    getAllOccasions = async (req, res) => {
        try {
            const occasions = await this.occasionUseCase.getAllOccasions();
            res.json(occasions);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    updateOccasion = async (req, res) => {
        try {
            const updatedOccasion = await this.occasionUseCase.updateOccasion(req.params.id, req.body); 
            if (!updatedOccasion) {
                return res.status(404).json({ error: 'Occasion not found' });
            }
            res.json(updatedOccasion);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    deleteOccasion = async (req, res) => {
        try {
            const deleted = await this.occasionUseCase.deleteOccasion(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Occasion not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
module.exports = OccasionController;