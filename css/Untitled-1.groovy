 // Configuration
  const EMAIL_TO = 'troublea88@gmail.com';
  const SHEET_NAME = 'Feuille 1';
  function doPost(e) {
    try {                                                                                                                                                                                     
      const data = JSON.parse(e.postData.contents);                                                                                                                                           

      // Enregistrer dans le Sheet
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      sheet.appendRow([
        data.timestamp,
        data.name,
        data.presence,
        data.guests,
        data.events,
        data.message
      ]);

      // Envoyer email de notification
      sendNotificationEmail(data);

      return ContentService
        .createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
      return ContentService
        .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  function sendNotificationEmail(data) {
    const presence = data.presence === 'oui' ? '✅ OUI' : '❌ NON';

    let subject = `RSVP Mariage - ${data.name} : ${presence}`;

    let body = `
  Nouvelle réponse RSVP !

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━

  👤 NOM : ${data.name}

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🎉 PRÉSENCE : ${presence}
  👥 NOMBRE D'INVITÉS : ${data.guests}
  📅 ÉVÉNEMENTS : ${data.events}

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━

  💬 MESSAGE :
  ${data.message || 'Aucun message'}

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📅 Reçu le : ${data.timestamp}
    `;

    MailApp.sendEmail({
      to: EMAIL_TO,
      subject: subject,
      body: body
    });
  }

  // Test - à supprimer après
  function testDoPost() {
    const testData = {
      postData: {
        contents: JSON.stringify({
          name: "Test User",
          presence: "oui",
          guests: "2",
          events: "henne, houppa",
          message: "Test message",
          timestamp: new Date().toLocaleString('fr-FR')
        })
      }
    };
    doPost(testData);
  }
