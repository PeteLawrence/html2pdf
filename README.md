# html2pdf
A Lambda function for generating PDF's from HTML.  A short-lived S3 signed URL will be returned.

A Cloudformation template is included that set's up the function, bucket and required roles.  It also sets up a Lifecycle rule to delete old reports from the bucket automatically.

# Usage
```js
var lambda = new AWS.Lambda();
var params = {
  FunctionName: 'FunctionName', /* required */
  Payload: 'JSON formatted event - see lambda/event.json for an example'
};
lambda.invoke(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data.url);           // successful response
});
```
