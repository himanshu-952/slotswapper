const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getSwappableSlots,
  createSwapRequest,
  respondToSwap,
  getSwapRequests
} = require('../controllers/swapController');

router.get('/swappable-slots', auth, getSwappableSlots);
router.post('/swap-request', auth, createSwapRequest);
router.post('/swap-response/:requestId', auth, respondToSwap);
router.get('/swap-requests', auth, getSwapRequests);

module.exports = router;
