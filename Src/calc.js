
var ops = {
    '+': 0,
    '-': 0,
    '*': 1,
    '/': 1
};

/* convert to postfix notation */
var parse_exp = function(expString){
    var stack = [];
    var post_array = [];
    var curr_token = "";
    for(var i=0;i<expString.length;i++){
        var ch=expString[i];
        if(ops.hasOwnProperty(ch)){
            post_array.push(curr_token);
            curr_token = "";
            if(stack.length==0){
                stack.push(ch);
            }else{
                var topStack = stack[stack.length-1];
                while(stack.length>0 && ops[topStack]>=ops[ch]){
                    post_array.push(topStack);
                    stack.pop();
                    topStack = stack[stack.length-1];
                }
                stack.push(ch);
            }
        }else{
            curr_token += ch;
        }
    }
    /* Push remaining token and operators into postfix array */
    if(curr_token)
        post_array.push(curr_token);
    while(stack.length>0){
        post_array.push(stack.pop());
    }
    return post_array;
};

function eval_func(post_array){

}