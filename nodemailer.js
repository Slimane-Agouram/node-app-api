var path           = require('path')
  , templatesDir   = path.resolve(__dirname, '..', 'node-app-api/templates')
  , emailTemplates = require('email-templates')
  , nodemailer     = require('nodemailer');


exports.sendMails=function SendMails(users,template_required,subject,fromWho)
{
emailTemplates(templatesDir, function(err, template) {

  if (err) {
  	console.log("erreur pour retrouver les templates");
  	  	    console.log(err);
  } else {


    // ## Send a batch of emails and only load the template once

    // Prepare nodemailer transport object
    console.log("preparing shit, templatesDir:" + templatesDir);
    var transportBatch = nodemailer.createTransport("SMTP", {
      service: "Gmail",
      auth: {
        user: "test.dev.slimane@gmail.com",
        pass: "DeveloperForTheWin"
      }
    });


    var Render = function(locals) {
      this.locals = locals;
      this.send = function(err, html, text) {
        if (err) {
          console.log(err);
        } else {
          transportBatch.sendMail({
            from: fromWho,
            to: locals.email,
            subject: subject,
            html: html,
            // generateTextFromHTML: true,
            text: text
          }, function(err, responseStatus) {
            if (err) {
              console.log(err);
            } else {
              console.log(responseStatus.message);
            }
          });
        }
      };
      this.batch = function(batch) {
        batch(this.locals, templatesDir, this.send);
      };
    };

    // Load the template and send the emails
    template( template_required, true, function(err, batch) {
      for(var user in users) {
        var render = new Render(users[user]);
        render.batch(batch);
      }
    });

  }
});

};