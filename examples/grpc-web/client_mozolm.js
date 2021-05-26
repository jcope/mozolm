// Copyright 2021 Anonymous Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {LMScores, GetContextRequest, NextState,
       UpdateLMScoresRequest} = require('./service_pb.js');
const {MozoLMServiceClient} = require('./service_grpc_web_pb.js');

window.prob_vector = [];
window.k_best = 7;

window.inputChange = function(value){
  //Create async function to retrive data, and then update display
  mozolm(value).then(()=>{
    showList();
  });
}

window.mozolm = function(context){ return new Promise(function(resolve, reject) {
  var client = new MozoLMServiceClient('http://' + window.location.hostname + ':8080',
                                 null, null);
  // simple unary call
  var request = new GetContextRequest();
  request.setContext(context);
  request.setState(-1);

  client.getLMScores(request, {}, (err, response) => {
    if (err) {
      console.log(`Unexpected error for GetLMScores: code = ${err.code}` +
                  `, message = "${err.message}"`);
    } else {
      var symbols = response.getSymbolsList();
      var probabilities = response.getProbabilitiesList();

      //Make pair, then sort on probability, then reverse
      prob_vector = [];
      var prob_size = symbols.length;
      for (i = 0; i < prob_size; i++) {
        prob_vector.push({s:symbols[i],
                          p:probabilities[i]});
      }
      prob_vector.sort((a, b) => a.p - b.p);
      prob_vector.reverse();
      resolve(prob_vector);
    }
  });
});}

window.showList = function(){
    let listContainer = document.getElementById('listDiv')
    if(listContainer){
      //Clear out the current data
      listContainer.removeChild(listContainer.childNodes[0]);
    }
    if(!listContainer){
      //Create new element
      listContainer = document.createElement('div');
      listContainer.setAttribute("id", "listDiv");
      document.getElementsByTagName('body')[0].appendChild(listContainer);
    }

    // Make the list
    let listElement = document.createElement('ul'),
    // Set up a loop that goes through the items in listItems one at a time
    numberOfListItems = k_best,
    listItem,
    i;

    // Add it to the page
    listContainer.appendChild(listElement);
    for (i = 0; i < numberOfListItems; ++i) {
        // create an item for each one
        listItem = document.createElement('li');

        // Add the item text
        listItem.innerHTML = "[" + prob_vector[i]['s'] + "," + prob_vector[i]['p'] + "]";

        // Add listItem to the listElement
        listElement.appendChild(listItem);
    }
}
