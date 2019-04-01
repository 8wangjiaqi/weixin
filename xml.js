const xmlparse = require('xml2js').parseString;

var xml_text = `
    <xml>
        <from>Albert</from>
        <to>Hilbert</to>
        <content>E=MC^2</content>
    </xml>
`;

xmlparse(xml_text,  (err, result) => {
    if (err) {
        console.log(err);
    } else {
        console.log(result);
    }
});


/*
xmlparse(xml_text, {explicitArray : false}, (err, result) => {
    if (err) {
        console.log(err);
    } else {
        console.log(result);
    }
});
*/
