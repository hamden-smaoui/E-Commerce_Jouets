const express = require('express');
const router = express.Router();
const NewsletterController = require('../controllers/newsLetterController');
const { authMiddleware } = require('../middlewares/auth');



router.post('/subscribe', NewsletterController.subscribe);

router.get('/', NewsletterController.getAll);

router.post('/unsubscribe', NewsletterController.unsubscribe);
router.post('/campaigns', NewsletterController.createCampaign);
router.get('/campaigns', NewsletterController.getCampaigns);
router.post('/campaigns/:campaignId/send', NewsletterController.sendCampaign);
router.delete('/campaigns/:campaignId', NewsletterController.deleteCampaign);
router.put('/campaigns/:campaignId', NewsletterController.updateCampaign);

module.exports = router;
