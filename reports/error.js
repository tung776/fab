/*
https://github.com/patriksimek/vm2
https://stackoverflow.com/questions/45940654/how-to-get-the-result-of-the-code-which-is-run-by-node-vm2,
*/
({
    index: Number,     
    next: Number,     
    conditionType: String,
    selector: String,
    url: String,
    actionType: String,
    wait: String,
    description: String,
    source: {
    modelObject: {
        //Ví dụ Account
        name: String, //tên trường: lastname, username
        property: String // id account
    },
    documentEval: String,
    customFunction: String
    }
})

conditionEnum = {
    name: String, //for, if, end_for, end_if
    value: String
}

conditionType = {
    name: String,
    count: Number,
    next: Number,
}



conditionEnum = [
    {
        name: 'for', //for, if, end_for, end_if
        value: 'for'
    },
    {
        name: 'end_for', //for, if, end_for, end_if
        value: 'end_for'
    },
    {
        name: 'if', //for, if, end_for, end_if
        value: 'if'
    },
    {
        name: 'end_if', //for, if, end_for, end_if
        value: 'end_if'
    }
]
/*
b1: lấy danh sách các post
b2 lặp qua các post
b3 thực hiện like
b4 thoát
*/


(
    {
    _id: 'mongoose.Schema.Types.ObjectId',
    name: 'like post',
    description: 'thực hiện các hoạt động like',
    steps: [
        {
            index: 1,
            next: 2,     
            conditionType: null,
            selector: '',
            url: 'facebook.com/userid/post',
            actionType: 'url',
            wait: 'navigation',
            description: 'goto url post',
            source: {
                modelObject: {
                name: '',
                property: ''
                },
                documentEval: '',
                customFunction: ''
            }
        },
        {
            index: 2,
            next:6, // thoát trình duyệt 
            conditionType: conditionType = {
                name: 'if',
                count: 0, // <= 0 không thử lại, n thử lại n lần, 
                next: 3, //điều kiện kiểm tra là đúng
            },
            selector: '#post > a[name="like"]',
            url: '',
            actionType: 'custom',
            wait: String,
            description: String,
            source: {
                modelObject: {
                name: '',
                property: ''
                },
                documentEval: '', //document.querySelectorAll(selector).length > 0 ? true : false
                customFunction: `
                module.exports = function(selector, callback) {
                    var count = page.$$(selector).length;
                    return count > 0 ? true : false
                }
                ` //kết quả sau khi chay function này được lưu tronmg biến context.step2.result, sẽ chứa danh sách các tag post 
            }
        },
        {
            index: 3,     
            next: 4,     
            conditionType: conditionType = {
                name: 'for',
                count: -1, // count = n, n là số lần lặp lại của for, n =-1 thì count sẽ lấy trong core function
                next: 3, 
            },
            selector: '#post > a[name="like"]',
            url: '',
            actionType: 'custom',
            wait: 'select',
            description: '',
            source: {
                modelObject: {
                    name: '',
                    property: ''
                },
                documentEval: '',
                customFunction: `
                module.exports = function(context, callback) {
                    var element = context.page.$$(context.selector);
                    callback(element)
                }
                `
            }
        },
        {
            index: 4,     
            next: 5,     
            conditionType: null,
            selector: '{{ selector }}', //selector nhiễm từ ứng dụng
            url: '',
            actionType: 'button',
            wait: '',
            description: '',
            source: {
                modelObject: {
                    name: '',
                    property: ''
                },
                documentEval: '',
                customFunction: ''
            }
        },
        {
            index: 5,     
            next: 6,     
            conditionType: {
                name: 'end_for',
                count: 0, // count = n, n là số lần lặp lại của for, n =-1 thì count sẽ lấy trong core function
                next: null, 
            },
            selector: '',
            url: '',
            actionType: '',
            wait: '',
            description: '',
            source: {
                modelObject: {
                name: '',
                property: ''
                },
                documentEval: '',
                customFunction: ''
            }
        },
        {
            index: 6,     
            next: 0,     
            conditionType: null,
            selector: '',
            url: '',
            actionType: 'close',
            wait: '',
            description: '',
            source: {
                modelObject: {
                name: '',
                property: ''
                },
                documentEval: '',
                customFunction: ''
            }
        }
    ]
    }
)





















"Cast to Array failed for value "
[ 
    {
     index: 1,
     selector: '',
     description: 'ádasdasd',   
     url: 'google.com',
     actionType: 'url',
     wait: '',  
     source: { 
         documentEval: '', 
         object: [Object], 
         customFunction: '' 
        } 
    },
    { 
        index: 2,   
        selector: '#email',   
        description: 'ádasd',    
        url: '',  
        type: 'email',    
        wait: '',
        source: { 
            documentEval: '', 
            object: [Object], 
            customFunction: '' 
        } 
    },  
    { 
        index: 3,    
        selector: '#submit',    
        description: 'click',    
        url: '',    
        type: 'button',    
        wait: 'navigation',   
        source: { 
            documentEval: '', 
            object: [Object], 
            customFunction: '' 
        },
    },  
    { 
        index: 4,    
        selector: '',    
        description: 'close',    
        url: '',    
        type: 'close',    
        wait: '',    
        source: { 
            documentEval: '', 
            object: [Object], 
            customFunction: '' 
        } 
    }
]" at path "steps""