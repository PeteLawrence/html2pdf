# html2pdf
A Lambda function for generating PDF's from HTML.  An S3 signed URL will be returned.

# Usage
```js
var params = {
  FunctionName: 'FunctionName', /* required */
  Payload: 'JSON formatted event - see lambda/event.json for an example'
};
lambda.invoke(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data.url);           // successful response
});
```
