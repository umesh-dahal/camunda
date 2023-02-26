import { Client, logger } from "camunda-external-task-client-js";
import { Variables } from "camunda-external-task-client-js";
import nodemailer from 'nodemailer';

const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000 };
const client = new Client(config);
 client.subscribe('informieren', async function({ task, taskService }) {
// Use at least Nodemailer v4.1.0
var inhaltsqualitaet = task.variables.get('inhaltsqualitaet')
var vorname = task.variables.get('vorname')
var nachname = task.variables.get('nachname')
var matrikel = task.variables.get('matrikel') 
var dauer = task.variables.get('Dauer')
var datum_heute = new Date();
var datum_start = new Date(datum_heute.getTime());
datum_start.setDate(datum_heute.getDate() + 1);

if (dauer=="9 Wochen"){
    var datum_abgabe = new Date(datum_heute.getTime());
    datum_abgabe.setDate(datum_heute.getDate() + 63);
}
else{
    var datum_abgabe = new Date(datum_heute.getTime());
    datum_abgabe.setDate(datum_heute.getDate() + 154);
}



// Generate SMTP service account from ethereal.email
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }

    console.log('Credentials obtained, sending message...');

    // Create a SMTP transporter object
    let transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: 'stanford.bayer@ethereal.email',
            pass: 'tf3NJRZswpFgMesaEu'
        }
    });
    if (inhaltsqualitaet == true){
    // Message object
    let message = {
        from: 'Sender Name <sender@example.com>',
        to: 'Recipient <recipient@example.com>',
        subject: 'Zulassung zur Abschlussarbeit',
        text: 'Liebe/r' + vorname+' '+nachname+ ' ' + matrikel + ', Hiermit bestaetigen wir die Zulassung fuer die Abschlussarbeit. Das Startdatum folgt '+ datum_start.toDateString() + 
        ' & das Abdage datum ist '+ datum_abgabe.toDateString()+  'Mit freundlichen Gruessen'
       
    }
    }
    else if(inhaltsqualitaet == false) {
    let message = {
        from: 'Sender Name <sender@example.com>',
        to: 'Recipient <recipient@example.com>',
        subject: 'Ablehnung zur Abschlussarbeit',
        text: 'Liebe/r Student/in, Hiermit lehnen wir die Zulassung fuer die Abschlussarbeit ab. Mit freundlichen Gruessen'
           
    } 
    }   
    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
        }

        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        taskService.complete(task);
    });
});
});