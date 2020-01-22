var wkhtmltopdf = require('wkhtmltopdf');
var fs = require('fs');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var config = require('./config.js');

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

exports.handler = function(event, context, callback) {

  //Error if no HTML has been supplied
  if (!event.html) {
    callback('No HTML supplied');
  }


  var output_filename = 'report_' + Math.random().toString(36).slice(2) + '.pdf';
  var output = '/tmp/' + output_filename;

  writeStream = fs.createWriteStream(output);


  //Write the header to a file for wkhtmltopdf to use
  var headerHtml = "<body style='overflow:hidden;margin:0;padding:0;'>" + event.header.html + "</body>";
  fs.writeFile('/tmp/header.html', "<!DOCTYPE html>\n" + headerHtml, (err) => {
    if (err) throw err;
  });

  //Write the footer to a file for wkhtmltopdf to use
  var footerHtml = "<body style='overflow:hidden;margin:0;padding:0;'>" + event.footer.html + "</body>";
  fs.writeFile('/tmp/footer.html', "<!DOCTYPE html>\n" + footerHtml, (err) => {
    if (err) throw err;
  });

  //Build the options for wkhtmltopdf
  var options = {
    marginTop: (event.margins && event.margins.top) ? event.margins.top : 10,
    marginRight: (event.margins && event.margins.right) ? event.margins.right : 10,
    marginBottom: (event.margins && event.margins.bottom) ? event.margins.bottom : 10,
    marginLeft: (event.margins && event.margins.left) ? event.margins.left : 10,
    headerHtml: '/tmp/header.html',
    headerSpacing: (event.header && event.header.spacing) ? event.header.spacing : 0.0001,
    footerHtml: '/tmp/footer.html',
    footerSpacing: (event.footer && event.footer.spacing) ? event.footer.spacing : 0.0001,
    pageSize: event.pagesize || 'A4',
    title: event.title || ''
  };

  wkhtmltopdf(event.html, options, function(code, signal) {

    s3.putObject({
      Bucket : config.bucket,
      Key : output_filename,
      Body : fs.createReadStream(output),
      ContentType : "application/pdf"
    }, function(error, data) {

      if (error != null) {
        callback('Unable to upload report');
      } else {
        //Generate a signed URL
        var signedUrl = s3.getSignedUrl('getObject', { Bucket: config.bucket, Key: output_filename, Expires: 60 });
        callback(null, { url: signedUrl });
      }
    });

  }).pipe(writeStream);

};
