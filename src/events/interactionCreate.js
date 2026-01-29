const { Events, InteractionType } = require('discord.js');
const { handleButtonInteraction } = require('../utils/buttonHandler');
const { handleModalSubmit } = require('../utils/modalHandler');
const { handleSelectMenuInteraction } = require('../utils/selectMenuHandler');
const { createErrorEmbed } = require('../utils/embeds');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      // Handle slash commands
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
          console.error(`ไม่มีคำสั่งที่ตรงกัน ${interaction.commandName} พบว่า.`);
          return;
        }

        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(`เกิดข้อผิดพลาดในการดำเนินการ ${interaction.commandName}`);
          console.error(error);
          
          try {
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ 
                embeds: [createErrorEmbed(
                  'ข้อผิดพลาดของคำสั่ง', 
                  'เกิดข้อผิดพลาดขณะดำเนินการคำสั่งนี้!',
                  error.message
                )],
                ephemeral: true 
              });
            } else {
              await interaction.reply({ 
                embeds: [createErrorEmbed(
                  'ข้อผิดพลาดของคำสั่ง', 
                  'เกิดข้อผิดพลาดขณะดำเนินการคำสั่งนี้!',
                  error.message
                )],
                ephemeral: true 
              });
            }
          } catch (replyError) {
            console.error(`ไม่สามารถส่งการตอบกลับข้อผิดพลาดสำหรับคำสั่งได้ ${interaction.commandName}:`, replyError);
            // At this point, we can't do anything more with this interaction
          }
        }
      }
      
      // Handle button interactions
      else if (interaction.isButton()) {
        try {
          await handleButtonInteraction(interaction);
        } catch (error) {
          console.error(`การจัดการข้อผิดพลาด การโต้ตอบปุ่ม: ${interaction.customId}`);
          console.error(error);
          
          try {
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ 
                embeds: [createErrorEmbed(
                  'ข้อผิดพลาดของปุ่ม', 
                  'เกิดข้อผิดพลาดขณะประมวลผลการโต้ตอบนี้!',
                  error.message
                )],
                ephemeral: true 
              });
            } else {
              await interaction.reply({ 
                embeds: [createErrorEmbed(
                  'ข้อผิดพลาดของปุ่ม', 
                  'เกิดข้อผิดพลาดขณะประมวลผลการโต้ตอบนี!',
                  error.message
                )],
                ephemeral: true 
              });
            }
          } catch (replyError) {
            console.error(`ไม่สามารถส่งการตอบกลับข้อผิดพลาดสำหรับปุ่มได้ ${interaction.customId}:`, replyError);
            // At this point, we can't do anything more with this interaction
          }
        }
      }
      
      // Handle select menu interactions
      else if (interaction.isStringSelectMenu()) {
        try {
          // Check if this is a user selection menu
          if (interaction.customId.startsWith('user_select_')) {
            await handleSelectMenuInteraction(interaction);
          }
        } catch (error) {
          console.error(`การจัดการข้อผิดพลาดในการเลือกเมนูโต้ตอบn: ${interaction.customId}`);
          console.error(error);
          
          try {
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ 
                embeds: [createErrorEmbed(
                  'ข้อผิดพลาดในการเลือก', 
                  'เกิดข้อผิดพลาดขณะประมวลผลการเลือกของคุณ!',
                  error.message
                )],
                ephemeral: true 
              });
            } else {
              await interaction.reply({ 
                embeds: [createErrorEmbed(
                  'ข้อผิดพลาดในการเลือก', 
                  'เกิดข้อผิดพลาดขณะประมวลผลการเลือกของคุณ!',
                  error.message
                )],
                ephemeral: true 
              });
            }
          } catch (replyError) {
            console.error(`ไม่สามารถส่งการตอบกลับข้อผิดพลาดสำหรับเมนูที่เลือกได้ ${interaction.customId}:`, replyError);
            // At this point, we can't do anything more with this interaction
          }
        }
      }
      
      // Handle modal submissions
      else if (interaction.type === InteractionType.ModalSubmit) {
        try {
          await handleModalSubmit(interaction);
        } catch (error) {
          console.error(`การจัดการข้อผิดพลาดในการส่งโมดอล: ${interaction.customId}`);
          console.error(error);
          
          try {
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp({ 
                embeds: [createErrorEmbed(
                  'ข้อผิดพลาดในการส่งข้อมูล', 
                  'เกิดข้อผิดพลาดระหว่างการประมวลผลการส่งข้อมูลของคุณ!',
                  error.message
                )],
                ephemeral: true 
              });
            } else {
              await interaction.reply({ 
                embeds: [createErrorEmbed(
                  'ข้อผิดพลาดในการส่งข้อมูล', 
                  'เกิดข้อผิดพลาดขณะประมวลผลการส่งข้อมูลของคุณ!',
                  error.message
                )],
                ephemeral: true 
              });
            }
          } catch (replyError) {
            console.error(`ไม่สามารถส่งการตอบกลับข้อผิดพลาดสำหรับโมดอลได้ ${interaction.customId}:`, replyError);
            // At this point, we can't do anything more with this interaction
          }
        }
      }
    } catch (globalError) {
      // Global error handler for any unexpected errors
      console.error('ข้อผิดพลาดที่ไม่ได้จัดการในตัวจัดการปฏิสัมพันธ์:', globalError);
      
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ 
            embeds: [createErrorEmbed(
              'ข้อผิดพลาดที่ไม่คาดคิด', 
              'เกิดข้อผิดพลาดที่ไม่คาดคิดขณะประมวลผลการโต้ตอบของคุณ โปรดลองใหม่อีกครั้งในภายหลัง.',
              globalError.message
            )],
            ephemeral: true 
          });
        }
      } catch (finalError) {
        console.error('ไม่สามารถส่งการตอบกลับข้อผิดพลาดขั้นสุดท้ายได้:', finalError);
      }
    }
  }
}; 