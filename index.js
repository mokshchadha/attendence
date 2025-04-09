const nodemailer = require('nodemailer');
const { execSync } = require('child_process');
require('dotenv').config();


const transporter = nodemailer.createTransport({
host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user:process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_PASSWORD,
  }
});


function runTests() {
  try {
    const output = execSync('npx playwright test').toString();
    return output;
  } catch (error) {
    return error.output.toString();
  }
}

function getStatus(testResultStr){
  const lines = testResultStr.split("\n").filter(e=>e)
  const lastLine = lines[lines.length - 1]
  if(lastLine.includes('passed')){
    return 'Passed'
  }
  return 'Failed'
}

async function sendEmail(testResults) {
  const status = getStatus(testResults)
  console.log({status})
  const mailOptions = {
    from: process.env.GOOGLE_EMAIL,
    to: process.env.GOOGLE_EMAIL,
    subject: status + ' Attendance Status cronjob' ,
    text: testResults,
    attachments: [
      {
        filename: 'button_found_in_shadow_dom.png',
        path: './button_found_in_shadow_dom.png'
      },
      {
        filename: 'shadow_dom_structure.txt',
        path: './shadow_dom_structure.txt'
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Main function
async function main() {
  const testResults = runTests();
  await sendEmail(testResults);
}

main();