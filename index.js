var wkhtmltopdf = require('wkhtmltopdf');
var fs = require('fs');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var config = require('./config.js');

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

exports.handler = function(event, context) {
  console.log(config);
  return_data = {};
  if (event.html) {
    var output_filename = 'report_' + Math.random().toString(36).slice(2) + '.pdf';
    var output = '/tmp/' + output_filename;

    writeStream = fs.createWriteStream(output);


    //Write the header to a file for wkhtmltopdf to use
    var headerHtml = "<body style='height:50px;overflow:hidden;margin:0;padding:0;'>" + event.header.html + "</body>";
    fs.writeFile('/tmp/header.html', "<!DOCTYPE html>\n" + headerHtml);

    //Write the footer to a file for wkhtmltopdf to use
    var footerHtml = "<body style='height:50px;overflow:hidden;margin:0;padding:0;'>" + event.footer.html + "</body>";
    fs.writeFile('/tmp/footer.html', "<!DOCTYPE html>\n" + footerHtml);

    var options = {
      marginTop: event.margins.top || 20,
      marginRight: event.margins.right || 20,
      marginBottom: event.margins.bottom || 20,
      marginLeft: event.margins.left || 20,
      headerHtml: '/tmp/header.html',
      //headerSpacing: 50 //FIXME: Setting this causes the header not to be rendered at the moment
      footerHtml: '/tmp/footer.html',
    };

    wkhtmltopdf(event.html, options, function(code, signal) {

      s3.putObject({
        Bucket : config.bucket,
        Key : output_filename,
        Body : fs.createReadStream(output),
        ContentType : "application/pdf"
      }, function(error, data) {

        if (error != null) {
          console.log("error: " + error);
        } else {
          console.log('upload done...');
        }
        return_data = {
          filename : output_filename
        };
        // context.succeed("File has been uploaded");
        context.done(null, return_data);
      });

    }).pipe(writeStream);
  } else {
    console.log('error');
    context.done('unable to get the html', {});
  }

};
