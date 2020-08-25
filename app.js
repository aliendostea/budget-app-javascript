////////---------------- start - test
/*
var budgetController = (function() {

        var x = 23;
        var add = function(a){
            return x + a;
        }

        return {
            publicTest: function(b){
                    return add(b);
            }
        }
})();

var UIController = (function() {
            
    
            // some code
})();

var controller = (function (budgetCtrl, UICtrl) {

    var z = budgetCtrl.publicTest(5);

    return{
        anotherPublic: function(){
            console.log(z);
        }
    }

})(budgetController, UIController);
*/
////////---------------- end - test
////////---------------- start

///Budget controller
var budgetController = (function () {

        var Expense = function(id, description, value){
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        };

        Expense.prototype.calculatePercentages = function (totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            }  else {
                this.percentage = -1;
            }
        };

        Expense.prototype.getPercentages = function () {
                return this.percentage;
        };

        var Income = function(id, description, value){
            this.id = id;
            this.description = description;
            this.value = value;
        };

        var calculateTotal = function(type){
            var sum = 0;

            data.allItems[type].forEach(function(cur){
                // cur = current
                // sum = sum + cur.value;
                sum += cur.value;
            });
            data.totals[type] = sum;
            /*
             0
             [200, 400, 100]
             sum = 0 + 200
             sum = 200 + 400
             sum = 600 + 100 = 700
            */
        };

        //// esta no es la mejor forma de hacerlo
        // var allExpenses = [];
        // var allIncomes = [];
        // var totalExpenses = 0;

        //// esta es la mejor forma de hacerlo
        var data = {
            allItems:{
                exp: [],
                inc: []
            },
            totals: {
                exp: 0,
                inc: 0
            },
            budget: 0,
            percentage: -1
        };

        return{
            addItem: function (type, des, val){
                var newItem, ID;

                //create new ID
                //ID = last ID + 1                
                if (data.allItems[type].length > 0) {
                    ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                } else {
                    ID = 0;
                }

                // create new item based on 'inc' or 'exp' type
                if (type === 'exp'){
                    newItem = new Expense(ID, des, val);
                } else if (type === 'inc'){
                    newItem = new Income(ID, des, val);
                }
                
                //push it into our data structure
                data.allItems[type].push(newItem);

                //return the new element
                return newItem;
            },

            deleteItem: function(type, id) {
                var ids, index;
                // id = 6
                //[1, 2, 4, 6, 8]
                //index el index del 6 es = 3; se busca una forma de encontrar el index 3 del 6
                // se crea un array con todos los ID 

                ids = data.allItems[type].map(function(current) {
                    /// el map return a brand new array
                    return current.id; 
                });
                
                //// busca la posicion de id en el array
                index = ids.indexOf(id);

                if (index !== -1) {
                    /// splice va a eliminar elementos en la posicion index. eliminara 1 elemento
                    data.allItems[type].splice(index, 1);     
                }
            },

            calculateBudget: function() {

                /// calculate total income and expenses
                calculateTotal('exp');
                calculateTotal('inc');

                /// calculate the budget: income - expenses
                data.budget = data.totals.inc - data.totals.exp;

                /// calculate the percentage of income that we spent
                if (data.totals.inc > 0){
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                } else {
                    data.percentage = -1;
                }

                /// expense = 100 and income 200, spent 50% = 100/200 = 0.5 * 100
            },

            calculatePercentages: function () {
                data.allItems.exp.forEach(function(current) {
                    current.calculatePercentages(data.totals.inc);                    
                });               
            },

            getPercentages: function() {
                var allPerc = data.allItems.exp.map(function(current) {
                     return current.getPercentages();
                });         
                return allPerc;         
            },

            getBudget: function() {
                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                };
            },

            testing: function() {
                console.log(data);
            }
        };
})();

/// UI controller
var UIController = (function () {

        var DOMstrings = {
            inputType: '.add__type',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            inputBtn: '.add__btn',
            incomeContainer: '.income__list',
            expensesContainer: '.expenses__list',
            budgetLabel: '.budget__value',
            incomeLabel: '.budget__income--value',
            expensesLabel: '.budget__expenses--value',
            percentageLabel: '.budget__expenses--percentage',
            container: '.container',
            expensesPercLabel: '.item__percentage',
            dateLabel: '.budget__title--month',
        };

        var formatNumber = function(num, type) {
            var numSplit, int, dec, type;
            /*
            + or - brfore number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> 2,310.46
            */
            num = Math.abs(num);
            num = num.toFixed(2);

            numSplit = num.split('.');

            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
                /// input 23510, output 23,510
            }

            dec = numSplit[1];

            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };

        var nodeListForEach = function (list, callback) {
            for (var i = 0; i < list.length; i++) {
                callback(list[i], i);
            }
        };

        return{
            getinput: function(){
                return{
                    type: document.querySelector(DOMstrings.inputType).value, /// will be either inc or exp
                    description: document.querySelector(DOMstrings.inputDescription).value,
                    value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                };    
            },

            addListItem: function(obj, type) {
                var html, newHtml, element;
                /// create HTML string with placeholder text

                if (type === 'inc') {
                    element = DOMstrings.incomeContainer;
                    html =
                        `
                        <div class="item clearfix" id="inc-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>
                        `;
                } else if (type === 'exp'){
                    element = DOMstrings.expensesContainer;
                    html =
                        `
                        <div class="item clearfix" id="exp-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>
                        `;
                }
                /// replace the placeholder text with some actual data
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

                /// inseert the HTML into the DOM
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            },

            deleteListItem: function(selectorID) {
                var element = document.getElementById(selectorID);
                element.parentNode.removeChild(element);
            },

            clearFields: function() {
                let fields, fieldsArr;

                fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

                
                 fieldsArr = Array.prototype.slice.call(fields);
                 
                 fieldsArr.forEach(function(current, index, array) {
                    current.value = "";                    
                 });

                 fieldsArr[0].focus();
            },

            displayBudget: function(obj) {
                var type;
                obj. budget > 0 ? type = 'inc' : type = 'exp';

                document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
                document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
                document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
                
                if (obj.percentage > 0) {
                    document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
                } else {
                    document.querySelector(DOMstrings.percentageLabel).textContent = '---';
                }
            },

            displayPercentages: function (percentages) {
                var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);          

                nodeListForEach(fields, function(current, index) {
                    if (percentages[index] > 0) {
                        current.textContent = percentages[index] + '%';
                    } else {
                        current.textContent ='---';
                    }      
                }); 
            },

            displayMonth: function (percentages) {
                var now, year, months, month;

                now = new Date();
                // var chrismas = new Date(2020, 11, 25);

                months = ['Jan', 'Feb', 'Marc', 'Apr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

                month = now.getMonth();

                year = now.getFullYear();
                document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            },

            changedType: function() {
                var fields = document.querySelectorAll(
                    DOMstrings.inputType + ',' +
                    DOMstrings.inputDescription + ',' +
                    DOMstrings.inputValue
                    );  
                
                nodeListForEach(fields, function(current) {
                    current.classList.toggle('red-focus');                    
                });

                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            },

            getDOMstrings: function () {
                return DOMstrings;
            }
        };   
   

})();

/// Global App controller
var controller = (function (budgetCtrl, UICtrl) {

        var setupEventListeners = function() {
            var DOM = UICtrl.getDOMstrings();

            document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

            document.addEventListener('keypress', function (event) {
                if (event.keyCode === 13 || event.which === 13) {
                    ctrlAddItem();
                }
            });

            document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

            document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        };  

        var updatePercentages = function() {
          /// 1. Calculate percentages
          budgetCtrl.calculatePercentages();
          
          /// 2. Read percentages from the budget controller
          var percentages = budgetCtrl.getPercentages();

          /// 3. Update the UI with new percentages
          UICtrl.displayPercentages(percentages);
        };
        
        var updateBudget = function() {
              /// to do list: 1. calculate de budget
              budgetCtrl.calculateBudget();

              /// to do list: 2. return de budget
              var budget = budgetCtrl.getBudget();

              // 3. Display the budget on the UI
              UICtrl.displayBudget(budget); 
              
        };

        var ctrlAddItem = function (){
            var input, newItem;
                    /// to do list: 1. get the field input data
                    input = UICtrl.getinput();

                    if(input.description !== '' && !isNaN(input.value) && input.value > 0){
                        /// to do list: 2. add the item to the budget controller
                        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                        /// to do list: 3. add the item to the UI
                        UICtrl.addListItem(newItem, input.type);
                        // UIController.addListItem(newItem, input.type);

                        /// to do list: 4. clear the fields
                        UICtrl.clearFields();
                        // UIController.clearFields();

                        /// to do list: 5. clear the fields
                        updateBudget();

                        /// 6. calculate and update percentages
                        updatePercentages();
                    }     
        };

        var ctrlDeleteItem = function(event) {
            var itemID, splitID, type, ID;

            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

            if (itemID) {
                //inc-1
                splitID = itemID.split('-'); ///ejem: splitID = 'inc-1';  splitID.split('-'); splitID = ["inc", "1"]
                type = splitID[0];
                ID = parseInt(splitID[1]);

                //// 1. delete the item from the data structure
                budgetCtrl.deleteItem(type, ID);

                //// 2. delete the item from UI
                UICtrl.deleteListItem(itemID);

                //// 3. Update and show the new budget
                updateBudget();

                /// 4. calculate and update percentages
                updatePercentages();
            }

        };

        return{
            init: function() {
                console.log('START!!!!');
                UICtrl.displayMonth();
                /// to do list: 3. display the budget on the UI
                UICtrl.displayBudget(
                    {
                        budget: 0,
                        totalInc: 0,
                        totalExp: 0,
                        percentage: -1
                    }
                );
                setupEventListeners();
            }
        }

})(budgetController, UIController);

controller.init();