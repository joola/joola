[HOME](Home) > [TECHNICAL DOCUMENTATION](technical-documentation) > [EXAMPLES](examples) > **USING PHP TO PUSH DATA**

### Pushing a document via Beacon API

The short example below uses a function called `beaconSend` to store documents within joola.

```php
function beaconSend($host, $port, $workspace, $apitoken, $collection, $document) {                                                                              
	$ch = curl_init($host . ':' . $port . '/beacon/' . $workspace . '/' . $collection . '?APIToken=' . $apitoken);                                                                      
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
	curl_setopt($ch, CURLOPT_POSTFIELDS, $document);                                                                  
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
	    'Content-Type: application/json',                                                                                
	    'Content-Length: ' . strlen($document))                                                                       
	);                                                                                                                   
	 
	$result = curl_exec($ch);
	curl_close($ch);
}

beaconSend('http://joola', '8080', 'demo', 'apitoken-demo', 'demo', '{"visitor":1, "browser": "Chrome", "os": "Linux"}');

```

