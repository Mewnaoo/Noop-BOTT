const { connectToDatabase } = require('../utils/database');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    // Connect to MongoDB
    await connectToDatabase();
    
    console.log(`พร้อมแล้ว! เข้าสู่ระบบในฐานะ ${client.user.tag}`);
    
    // Set bot status
    client.user.setPresence({
      activities: [{ name: 'Noop Bot', type: 2 }],
      status: 'ออนไลน์'
    });
  }
}; 