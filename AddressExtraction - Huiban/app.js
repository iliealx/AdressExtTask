//
//We take each website separately;
//We convert it from html to text;
//We go through the newly converted text and look for the address, following the pattern, which is presented below


const { convert } = require('html-to-text');
const axios = require('axios');
const https = require('https');
const fs = require('fs');


// We ignore SSL certificate errors to access HTTPS pages
const agent = new https.Agent({  
    rejectUnauthorized: false
  });

(async () => {
    try {
      const data = JSON.parse(fs.readFileSync('domains.json', 'utf8'));
      const domains = data.map(item => item.domain);
      if (Array.isArray(domains)) {
        for(const domain of domains) {
          try {
               // We access the HTML content of the web page
                const response = await axios.get(`https://www.${domain}/`, { httpsAgent: agent });
                const html = response.data;

                //We convert html to text, to be able to read the address more easily

                const text = convert(html, { 
                  wordwrap:130
                });

              
                //This regular expression is designed to identify addresses in a text, using a specific format that includes street numbers, street names, postal codes
                //I saw that the pattern of the addresses in these websites is: "Number, street, town, postal code".
                const addressRegex = /([0-9]{1,5}\s+[a-zA-ZäöüÄÖÜ#@.,\s]+[0-9]{1,5}\s+[a-zA-ZäöüÄÖÜ.,\s]+\s+[0-9]{5})/g; 
                const addresses = text.match(addressRegex);

                if( addresses ) {
                    const cleanedAddresses = addresses.map(address => address.replace(/\n/g, " "));
                    console.log('Addresses:', cleanedAddresses);
                } else {
                  console.log("No address found for: ", domain)
                }

          } catch (error) {
            console.error('Error fetching or parsing HTML:', error.message);
          }
        }
    } else {
      console.log('The JSON file does not contain a valid list of links.');
    } 
    
  } catch (error) {
        console.error('Error fetching or parsing HTML:', error.message);
    }
})();
