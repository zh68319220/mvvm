(function(){

    function observe (data) {
        if(!data || typeof data !== 'object'){
            return;
        }
        Object.keys(data).forEach(function(key){
            defineReactive(data, key, data[key]);
        });
    }

    function defineReactive (data, key, val){
        observe(val);
        var dep = new Dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                if(Dep.target) dep.addSub(Dep.target);
                console.log(dep.subs);
                return val;
            },
            set: function (newVal) {
                if(val === newVal){
                    return;
                }
                val = newVal;
                if (typeof val === 'object'){
                    observe(val);
                }
                dep.notify();
            }
        });
    }

    function nodeToFragment (node, data) {
        var flag = document.createDocumentFragment();
        while (node.firstChild) {
            var child = node.firstChild;
            compile(child, data);
            flag.appendChild(child);
        }
        return flag;
    }

    function compile (node, vm) {
        var reg = /\{\{(.*)\}\}/;
        switch(node.nodeType){
            case 1:
                var attr = node.attributes;
                for(var i = 0;i <= attr.length - 1;i++){
                    if(attr[i].nodeName === 'v-model'){
                        var name = attr[i].nodeValue;
                        node.addEventListener('input', function(e){
                            vm.data[name] = e.target.value;
                        });
                        node.removeAttribute('v-model');
                    }
                }
                break;
            case 3:
                if(reg.test(node.nodeValue)){
                    var name = RegExp.$1;
                    name = name.trim();
                    node.nodeValue = vm.data[name];
                    new Watcher(vm, node, name);
                }
                break;
            default:
                break;
        }
    }

    function Watcher (vm, node, name) {
        Dep.target = this;
        this.node = node;
        this.name = name;
        this.vm = vm;
        this.update();
        Dep.target = null;
    }

    Watcher.prototype = {
        update: function(){
            this.get();
            this.node.nodeValue = this.value;
        },
        get: function(){
            this.value = this.vm.data[this.name];
        }
    }

    function Dep () {
        this.subs = [];
    }

    Dep.prototype = {
        addSub: function(sub){
            this.subs.push(sub);
        },
        notify: function(){
            this.subs.forEach(function(sub){
                sub.update();
            });
        }
    }

    function MVVM (option) {
        this.data = option.data;
        this.el = document.getElementById(option.el);
        observe(this.data);
        var nodes = nodeToFragment(this.el, this);
        this.el.appendChild(nodes);
    }

})();