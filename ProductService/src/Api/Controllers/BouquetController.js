const BouquetUseCase = require('../../Application/UseCases/BouquetUseCase');
const BouquetDTO = require('../../Application/DTOs/Bouquet/BouquetDTO');
const RepositoryFactory = require('../../Infrastructure/Persistence/Factory/RepositoryFactory');

const bouquetRepo = RepositoryFactory.bouquet();

class BouquetController {
    constructor(rabbitService) {

        this.bouquetUseCase = new BouquetUseCase(bouquetRepo, rabbitService);
    }

    createBouquet = async (req, res) => {
        try {
            const dto = new BouquetDTO(req.body);
            const bouquet = await this.bouquetUseCase.createBouquet(dto);
            res.status(201).json(bouquet);

        } catch (error) {
            // res.status(400).json({ error: error.message });
            if (error.statusCode === 404) {
                return res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    getBouquetById = async (req, res) => {
        try {
            const bouquet = await this.bouquetUseCase.getBouquetById(req.params.id);
            if (!bouquet) {
                return res.status(404).json({ error: 'Bouquet not found' });
            }
            res.json(bouquet);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // getAllBouquets = async (req, res) => {
    //     try {
    //         const bouquets = await this.bouquetUseCase.getAllBouquets();
    //         res.json(bouquets);
    //     } catch (error) {
    //         res.status(400).json({ error: error.message });
    //     }
    // }

    updateBouquet = async (req, res) => {
        try {
            const updatedBouquet = await this.bouquetUseCase.updateBouquet(req.params.id, req.body);
            if (!updatedBouquet) {
                return res.status(404).json({ error: 'Bouquet not found' });
            }
            res.json(updatedBouquet);
        } catch (error) {
            if (error.statusCode === 404) {
                return res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    deleteBouquet = async (req, res) => {
        try {
            const deleted = await this.bouquetUseCase.deleteBouquet(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Bouquet not found' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    getAllBouquets = async (req, res) => {
        try {
            const qr = req.query;
            const result = await this.bouquetUseCase.getAllBouquets(qr);
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = BouquetController;