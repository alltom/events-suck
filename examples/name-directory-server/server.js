/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, setTimeout */

(function () {
    'use strict';


    var http = require('http');
    var connect = require('connect');

    var url = require('url');

    var host = '0.0.0.0';
    var port = 3000;

    var people = ["Amy Tobin", "Anthony Boling", "Olga Laine", "Harold Averett", "Melody Pettiford", "Vanessa Holloway", "Georgia Alfaro", "Jenny Hooper", "Sally Durden", "Jonathan Eubank", "Russell Owensby", "Michele Oconner", "Martin Overby", "Annie Slagle", "Gladys Sievers", "Dennis Deane", "Sue Simmons", "Joshua Montelongo", "Eva Bundy", "Craig Wargo", "Stanley Chaney", "Edward Ruhl", "Vickie Davison", "Hoggard", "Lillian Bigler", "Phillip Haynes", "Brandon Gilpin", "Renee Rodas", "Deborah Baxley", "Brandon Grissom", "Janie Twyman", "Gary Flack", "Phyllis Olmstead", "Curtis Farrington", "Charles Bowser", "Carl Robert", "Howard Elwell", "Ryan Hafner", "Arthur Budde", "Manuel Heywood", "Josephine Ardoin", "Cynthia Graham", "Thaxton", "Alicia Neilson", "Sharon Makowski", "Jack Mcnally", "Gwendolyn Richards", "Ryan Geter", "Peter Basile", "Lawrence Willingham", "Paula Lyons", "Antonio Earle", "Philip Sistrunk", "Edward Burkholder", "Helms", "Doris Brazil", "Elsie Blanchard", "Vicki Ko", "Antoinette Jett", "Larry Kirkwood"];
    people.sort();
    
    function search(term) {
        var results = [], i;
        for (i = 0; i < people.length; i++) {
            if (people[i].toLowerCase().indexOf(term.toLowerCase()) !== -1) {
                results.push(people[i]);
            }
        }
        return results;
    }

    // because JSLint thinks "static" is a reserved word, but connect disagrees.
    connect.theStatic = connect['static'];
    
    var app = connect()
        .use(connect.logger('dev'))
        .use(connect.favicon())
        .use(connect.theStatic('../'))
        .use(function (req, res) {
            var reqid = Math.random();
            var parsedUrl = url.parse(req.url, true);
            if (parsedUrl.href.indexOf('/search') === 0 &&
                    parsedUrl.hasOwnProperty('query') &&
                    parsedUrl.query.hasOwnProperty('s')) {
                var result = JSON.stringify(search(parsedUrl.query.s));
                var delay = Math.random() * 3000 + 500;
                console.log('Searched for', parsedUrl.query.s, 'responding in', delay, 'with', result);
                setTimeout(function () {
                    res.end(result);
                }, delay);
            } else {
                res.statusCode = 404;
                res.end("not found");
            }
        })
        .listen(port, host);
    console.log("listening on " + host + " port " + port);
}());
