const SubOccasionDTO = require('../../Application/DTOs/SubOccasion/SubOccasionDTO');
const SubOccasionUseCase = require('../../Application/UseCases/SubOccasionsUseCase');
const SubOccasionRepository = require('../../Infrastructure/Persistence/Factory/RepositoryFactory');
const subOccasionRepo = SubOccasionRepository.subOccasion();
class SubOccasionController {
    constructor(rabbitService) {
        this.subOccasionUseCase = new SubOccasionUseCase(subOccasionRepo, rabbitService);
    }
    createSubOccasion = async (req, res) => {
        try {
            const dto = new SubOccasionDTO(req.body);
            const subOccasion = await this.subOccasionUseCase.createSubOccasion(dto);
            res.status(201).json(subOccasion);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    getSubOccasionById = async (req, res) => {
        try {
            const subOccasion = await this.subOccasionUseCase.getSubOccasionById(req.params.id);
            if (!subOccasion) {
                return res.status(404).json({ error: 'SubOccasion not found' });
            }
            res.json(subOccasion);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    getAllSubOccasions = async (req, res) => {
        try {
            const subOccasions = await this.subOccasionUseCase.getAllSubOccasions();
            res.json(subOccasions);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    updateSubOccasion = async (req, res) => {
        try {
            const updatedSubOccasion = await this.subOccasionUseCase.updateSubOccasion(req.params.id, req.body);
            if (!updatedSubOccasion) {
                return res.status(404).json({ error: 'SubOccasion not found' });
            }
            res.json(updatedSubOccasion);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    deleteSubOccasion = async (req, res) => {
        try {
            const deleted = await this.subOccasionUseCase.deleteSubOccasion(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'SubOccasion not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
module.exports = SubOccasionController;