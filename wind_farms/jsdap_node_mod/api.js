var jsdap = {};

if (typeof require !== 'undefined' && module.exports) {
    parser = require('./parser');
    xdr = require('./xdr');

    //Workaround infinite recursion when jsdap is included in a webpack project
    if (typeof XMLHttpRequest === 'undefined') {
        XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
        http = require('http');
    }
}

(function() {
    'use strict';

    var XML_READY_STATE_DONE = 4;

    var proxyUrl = function(url, callback, binary) {

        function toArrayBuffer(buffer) {
            var ab = new ArrayBuffer(buffer.length);
            var view = new Uint8Array(ab);
            for (var i = 0; i < buffer.length; ++i) {
                view[i] = buffer[i];
            }
            return ab;
        }

        http.get(url, function(res) {
            var data = [];

            res.on('data', function(chunk) {
                data.push(chunk);
            }).on('end', function() {
                //at this point data is an array of Buffers
                //so Buffer.concat() can make us a new Buffer
                //of all of them together
                var buffer = Buffer.concat(data);
                callback(toArrayBuffer(buffer));
                // console.log(333, buffer.toString('base64'));
            });
        });



        // var xml = new XMLHttpRequest();

        // xml.open('GET', url, true);

        // if (binary) {
        //     xml.responseType = 'arraybuffer';
        // }
        // // else {
        //     if (xml.overrideMimeType) {
        //         xml.overrideMimeType('text/plain; charset=x-user-defined');
        //     }
        //     else {
        //         xml.setRequestHeader('Accept-Charset', 'x-user-defined');
        //     }
        // // }

        // xml.onreadystatechange = function() {
        //     if (xml.readyState === XML_READY_STATE_DONE) {
        //         if (binary) {
        //             var buf =
        //                    xml.responseBody             //XHR2
        //                 || xml.response                 //FF7/Chrome 11-15
        //                 || xml.mozResponseArrayBuffer;  //FF5

        //                 console.log(xml.responseText);
        //                 callback(xml.responseText);
        //             callback(buf);
        //         }
        //         else {
        //             callback(xml.responseText);
        //         }
        //     }
        // };
        // xml.send('');
    };

    var dodsRequest = function(url, callback) {
        //Returns an object containing the DDS for the requested data, as well as the requested data
        proxyUrl(url, function(dods) {
            var dataStart = '\nData:\n';
            var view = new DataView(dods);
            var byteIndex = 0;

            var dds = ''; //The DDS string

            while (byteIndex < view.byteLength) {
                dds += String.fromCharCode(view.getUint8(byteIndex));

                if (dds.indexOf(dataStart) !== -1) {
                    break;
                }

                byteIndex += 1;
            }

            dds = dds.substr(0, dds.length - dataStart.length); //Remove the start of data string '\nData:\n'
            dods = dods.slice(byteIndex + 1); //Split off the DDS data

            var dapvar = new parser.ddsParser(dds).parse();
            var data = new xdr.dapUnpacker(dods, dapvar).getValue();

            callback({dds: dapvar, data: data});
        }, true);
    };

    jsdap.loadDataset = function(url, callback, proxy) {
        //User proxy?
        if (proxy) url = proxy + '?url=' + encodeURIComponent(url);

        //Load DDS.
        proxyUrl(url + '.dds', function(dds) {
            var dataset = new parser.ddsParser(dds).parse();

            //Load DAS.
            proxyUrl(url + '.das', function(das) {
                dataset = new parser.dasParser(das, dataset).parse();
                callback(dataset);
            });
        });
    };

    jsdap.loadData = function(url, callback, proxy) {
        //User proxy?
        if (proxy) url = proxy + '?url=' + encodeURIComponent(url);

        dodsRequest(url, function(result) {
            callback(result.data);
        });
    };

    jsdap.loadDataAndDDS = function(url, callback, proxy) {
        //User proxy?
        if (proxy) url = proxy + '?url=' + encodeURIComponent(url);

        dodsRequest(url, function(result) {
            //Return the data and the DDS
            callback(result);
        });
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = jsdap;
    }
})();
