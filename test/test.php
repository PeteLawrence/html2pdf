<?php

require 'vendor/autoload.php';

$lambda = new Aws\Lambda\LambdaClient([
    'region' => 'eu-west-1',
    'version' => '2015-03-31'
]);

$event = buildEvent();

$result = $lambda->Invoke([
    'FunctionName' => 'html2pdf-Function-1T7KVC73Q1KRM',
    'InvocationType' => 'RequestResponse',
    'Payload' => json_encode($event)
]);

var_dump($result);



function buildEvent()
{
    return [
        'html' => file_get_contents('./test.html'),
        'margins' => [
            'top' => 10,
            'right' => 10,
            'bottom' => 10,
            'left' => 10
        ],
        'header' => [
            'html' => ''
        ],
        'footer' => [
            'html' => ''
        ],
        'title' => 'Hello World'
    ];
}
