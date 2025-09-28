const express = require('express');
const router = express.Router();
const NewsletterController = require('../controllers/newsLetterController');
const { authMiddleware ,adminMiddleware } = require('../middlewares/auth');



router.post('/subscribe', NewsletterController.subscribe);

router.get('/',authMiddleware , NewsletterController.getAll);

router.post('/unsubscribe',authMiddleware, NewsletterController.unsubscribe);
router.post('/campaigns',authMiddleware ,adminMiddleware, NewsletterController.createCampaign);
router.get('/campaigns',authMiddleware ,adminMiddleware, NewsletterController.getCampaigns);
router.post('/campaigns/:campaignId/send',authMiddleware ,adminMiddleware, NewsletterController.sendCampaign);
router.delete('/campaigns/:campaignId',authMiddleware ,adminMiddleware, NewsletterController.deleteCampaign);
router.put('/campaigns/:campaignId',authMiddleware ,adminMiddleware, NewsletterController.updateCampaign);

module.exports = router;
