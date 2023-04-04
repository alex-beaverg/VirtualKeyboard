let recognizing;
let recognizer = new webkitSpeechRecognition();
recognizer.interimResults = false;
recognizer.lang = 'en-US';
recognizer.continuous = true;

recognizer.onresult = function (event) {
    let result = event.results[event.resultIndex];                            
    if (result.isFinal) { 
        //Keyboard.properties.value += result[0].transcript;
        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
            Keyboard.properties.value = Keyboard.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + result[0].transcript + Keyboard.properties.memory;            
        } else {
            Keyboard.properties.value = result[0].transcript + Keyboard.properties.memory;
        }        
        setTimeout(() => {            
            Keyboard.properties.selection = Keyboard.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);                        
        });
        
        setTimeout(() => {
            document.querySelector(".use-keyboard-input").selectionStart = Keyboard.properties.value.length - Keyboard.properties.memory.length;
            document.querySelector(".use-keyboard-input").selectionEnd = Keyboard.properties.value.length - Keyboard.properties.memory.length;     
        }); 
        Keyboard._triggerEvent("oninput");      
    }
}; 

const Keyboard = {
    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    },

    properties: {
        value: "",
        capsLock: false,
        en: true,
        memory: "",
        shift: false,
        selection: "",
        voice: false
    },    

    init() {
        // Create main elements
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        // Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        // Automatically use keyboard for elements with .use-keyboard-input
        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;                    
                });
            });
            element.addEventListener("click", () => {
                this.properties.memory = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionEnd, this.properties.value.length);  
                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);                           
            });
        });
    },

    _createKeys() {        
        const fragment = document.createDocumentFragment();
        const keyLayout = [
            "`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace",
            "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]",
            "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "\\", "enter",
            "done", "shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/",
            "voice", "space", "en", "left", "right"
        ];
        let firstClickLeft = false;        

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        };
        
        keyLayout.forEach(key => {
            const keyElement = document.createElement("button");
            const insertLineBreak = ["backspace", "]", "enter", "/"].indexOf(key) !== -1;

            // Add attributes/classes
            keyElement.setAttribute("type", "button");            
            keyElement.classList.add("keyboard__key");            

            switch (key) { 
                case "voice":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark", "keyboard_voice");
                    keyElement.innerHTML = createIconHTML("keyboard_voice");
                    keyElement.id = `keyboard_voice`;                   

                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                                                                       
                        this._toggleVoice();                        
                        if (this.properties.voice) recognizer.start();
                        else recognizer.stop();
                        keyElement.classList.toggle("keyboard__key--active3", this.properties.voice);  
                    });

                    

                break;
                
                case "right":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("keyboard_arrow_right");
                    keyElement.id = `keyboard__arrowright`;
                    keyElement.addEventListener("mousedown", () => {    
                        document.getElementById(`keyboard__arrowright`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", () => {
                        document.getElementById(`keyboard__arrowright`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });

                    keyElement.addEventListener("click", () => {                        
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        document.querySelector(".use-keyboard-input").selectionStart++;                        
                        document.querySelector(".use-keyboard-input").selectionEnd = document.querySelector(".use-keyboard-input").selectionStart;
                        let sel = document.querySelector(".use-keyboard-input").selectionStart;
                        this.properties.memory = this.properties.value.slice(sel, this.properties.value.length);                        
                        this._triggerEvent("oninput");
                    });

                break;  
                case "left":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("keyboard_arrow_left");
                    keyElement.id = `keyboard__arrowleft`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__arrowleft`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__arrowleft`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });

                    keyElement.addEventListener("click", () => {  
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus(); 
                        if (!firstClickLeft) {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length;
                            firstClickLeft = true;
                        }
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {
                            document.querySelector(".use-keyboard-input").selectionStart--;
                            document.querySelector(".use-keyboard-input").selectionEnd--;
                        } else document.querySelector(".use-keyboard-input").selectionStart = document.querySelector(".use-keyboard-input").selectionEnd = 0;                        
                        this.properties.memory = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, this.properties.value.length);                        
                        this._triggerEvent("oninput");
                    });

                break;

                case "backspace":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("backspace");
                    keyElement.id = `keyboard__backspace`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__backspace`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__backspace`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });

                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();  
                        let plus = this.properties.selection.length;                                 
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {
                            if (plus === 0) {
                                this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart - 1) + this.properties.memory;
                            } else {
                                this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + this.properties.memory;
                                setTimeout(() => {
                                    this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                                });
                            }
                        } else this.properties.value = this.properties.memory;
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                                                                       
                        this._triggerEvent("oninput");                        
                    });

                    break;

                case "caps":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("keyboard_capslock");
                    keyElement.id = `keyboard__capslock`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__capslock`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__capslock`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });

                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.getElementById("keyboard__shift").classList.toggle("keyboard__key--dis", !this.properties.capsLock);
                        document.querySelector(".use-keyboard-input").focus();
                        this._toggleCapsLock();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);                        
                    });

                    break;

                case "shift":
                    keyElement.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable2");                    
                    keyElement.id = `keyboard__shift`;                    
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__shift`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__shift`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {                        
                        document.querySelector('audio').play();  
                        document.getElementById("keyboard__capslock").classList.toggle("keyboard__key--dis", !this.properties.shift);
                        document.querySelector(".use-keyboard-input").focus();
                        this._toggleShift();
                        keyElement.classList.toggle("keyboard__key--active2", this.properties.shift);
                    });
    
                    break;
                
                case "en":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.textContent = key.toUpperCase();
                    keyElement.id = `keyboard__${keyElement.textContent}`; 
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key.toUpperCase()}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key.toUpperCase()}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });                   

                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        this._toggleEn();
                    });

                    break;

                case "enter":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("keyboard_return");
                    keyElement.id = `keyboard__enter`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__enter`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__enter`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });

                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        let plus = this.properties.selection.length;
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
                            if (plus === 0) {
                                this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "\n" + this.properties.memory;
                            } else {
                                this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "\n" + this.properties.selection + this.properties.memory;                                                                                                                                                            
                            } 
                        } else {
                            if (plus === 0) {
                                this.properties.value = "\n" + this.properties.memory;                                
                            } else {
                                this.properties.value = "\n" + this.properties.selection + this.properties.memory;                                
                            }
                        }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length - plus;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length - plus;                                     
                          });                         
                        this._triggerEvent("oninput");
                    });

                    break;

                case "space":
                    keyElement.classList.add("keyboard__key--extra-wide");
                    keyElement.innerHTML = createIconHTML("space_bar");
                    keyElement.id = `keyboard__space`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__space`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__space`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });

                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {                       
                            this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + " " + this.properties.memory;
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else this.properties.value = " " + this.properties.memory;
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          }); 
                        this._triggerEvent("oninput");
                    });

                    break;

                case "done":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = createIconHTML("check_circle");

                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        this.close();
                        this._triggerEvent("onclose");
                    });

                    break;                
                
                case "1":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {   
                            this.properties.value = this.properties.shift ? 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "!" + this.properties.memory : 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "1" + this.properties.memory; 
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else this.properties.value = this.properties.shift ? "!" + this.properties.memory : "1" + this.properties.memory;
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          }); 
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "2":
                    keyElement.textContent = key;
                    keyElement.classList.add("keyboard__key--2q-ru");
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
			            if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "@" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "2" + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.shift ? "@" + this.properties.memory : "2" + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                        });                       
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "3":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "#" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "3" + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.shift ? "#" + this.properties.memory : "3" + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                            
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "4":
                    keyElement.textContent = key;
                    keyElement.classList.add("keyboard__key--dq-ru");
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "$" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "4" + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.shift ? "$" + this.properties.memory : "4" + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                          
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "5":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {   
                            this.properties.value = this.properties.shift ? 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "%" + this.properties.memory : 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "5" + this.properties.memory; 
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else this.properties.value = this.properties.shift ? "%" + this.properties.memory : "5" + this.properties.memory;
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                        
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "6":
                    keyElement.textContent = key;
                    keyElement.classList.add("keyboard__key--dd-ru");
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "^" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "6" + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                 else this.properties.value = this.properties.shift ? "^" + this.properties.memory : "6" + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                       
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "7":
                    keyElement.textContent = key;
                    keyElement.classList.add("keyboard__key--q-ru");
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "&" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "7" + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.shift ? "&" + this.properties.memory : "7" + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                          
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "8":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {   
                            this.properties.value = this.properties.shift ? 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "*" + this.properties.memory : 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "8" + this.properties.memory; 
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else this.properties.value = this.properties.shift ? "*" + this.properties.memory : "8" + this.properties.memory;
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                        
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "9":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {   
                            this.properties.value = this.properties.shift ? 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "(" + this.properties.memory : 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "9" + this.properties.memory; 
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else this.properties.value = this.properties.shift ? "(" + this.properties.memory : "9" + this.properties.memory;
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                        
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "0":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {   
                            this.properties.value = this.properties.shift ? 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + ")" + this.properties.memory : 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "0" + this.properties.memory; 
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else this.properties.value = this.properties.shift ? ")" + this.properties.memory : "0" + this.properties.memory;
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                         
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "/":
                    keyElement.textContent = key;
                    keyElement.classList.add("keyboard__key--dot-ru");
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "?" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "/" + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.shift ? "?" + this.properties.memory : "/" + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                           
                        this._triggerEvent("oninput");
                    });
    
                break;

                case ",":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "<" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "," + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.shift ? "<" + this.properties.memory : "," + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                         
                        this._triggerEvent("oninput");
                    });
    
                break;

                case ".":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + ">" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "." + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.shift ? ">" + this.properties.memory : "." + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                       
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "`":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "~" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "`" + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.shift ? "~" + this.properties.memory : "`" + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                       
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "-":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {   
                            this.properties.value = this.properties.shift ? 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "_" + this.properties.memory : 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "-" + this.properties.memory; 
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else this.properties.value = this.properties.shift ? "_" + this.properties.memory : "-" + this.properties.memory;
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                        
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "=":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {   
                            this.properties.value = this.properties.shift ? 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "+" + this.properties.memory : 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "=" + this.properties.memory; 
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else this.properties.value = this.properties.shift ? "+" + this.properties.memory : "=" + this.properties.memory;
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                       
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "[":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "{" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "[" + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.shift ? "{" + this.properties.memory : "[" + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                          
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "]":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "}" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "]" + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.shift ? "}" + this.properties.memory : "]" + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                   
                        this._triggerEvent("oninput");
                    });
    
                break;

                case ";":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + ":" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + ";" + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.shift ? ":" + this.properties.memory : ";" + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                         
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "'":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {  
			                if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
			                else {
                                this.properties.value = this.properties.shift ? 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "\"" + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "'" + this.properties.memory; 
                            }
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else {
			                if (!this.properties.en) this.properties.value = this.properties.shift ? keyElement.textContent + this.properties.memory : keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.shift ? "\"" + this.properties.memory : "'" + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });   
                        this._triggerEvent("oninput");
                    });
    
                break;

                case "\\":
                    keyElement.textContent = key;
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });
    
                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {   
                            this.properties.value = this.properties.shift ? 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "|" + this.properties.memory : 
                            this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + "\\" + this.properties.memory; 
                            setTimeout(() => {
                                this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                            });
                        } else this.properties.value = this.properties.shift ? "|" + this.properties.memory : "\\" + this.properties.memory;
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                          });                       
                        this._triggerEvent("oninput");
                    });
    
                break;

                default:
                    keyElement.textContent = key.toLowerCase();
                    keyElement.id = `keyboard__${keyElement.textContent}`;
                    keyElement.addEventListener("mousedown", function() {    
                        document.getElementById(`keyboard__${key.toLowerCase()}`).style.backgroundColor = "rgba(255, 255, 255, 0.12)";    
                    });
                    keyElement.addEventListener("mouseup", function() {
                        document.getElementById(`keyboard__${key.toLowerCase()}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    });                    

                    keyElement.addEventListener("click", () => {
                        document.querySelector('audio').play();  
                        document.querySelector(".use-keyboard-input").focus();
                        if (document.querySelector(".use-keyboard-input").selectionStart > 0) {
                            if (!this.properties.en) this.properties.value = this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + keyElement.textContent + this.properties.memory;
                            else {
                                this.properties.value = this.properties.capsLock || this.properties.shift ? 
				                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + key.toUpperCase() + this.properties.memory : 
                                this.properties.value.substring(0, document.querySelector(".use-keyboard-input").selectionStart) + key.toLowerCase() + this.properties.memory;
                                setTimeout(() => {
                                    this.properties.selection = this.properties.value.slice(document.querySelector(".use-keyboard-input").selectionStart, document.querySelector(".use-keyboard-input").selectionEnd);
                                });
                            }
                        } else {
			                if (!this.properties.en) this.properties.value = keyElement.textContent + this.properties.memory;
			                else this.properties.value = this.properties.capsLock || this.properties.shift ? key.toUpperCase() + this.properties.memory : key.toLowerCase() + this.properties.memory;
			            }
                        setTimeout(() => {
                            document.querySelector(".use-keyboard-input").selectionStart = this.properties.value.length - this.properties.memory.length;
                            document.querySelector(".use-keyboard-input").selectionEnd = this.properties.value.length - this.properties.memory.length;     
                        });                          
                        this._triggerEvent("oninput");
                    });

                break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak) {
                fragment.appendChild(document.createElement("br"));
            }
        });

        return fragment;
    },
    
    _triggerEvent(handlerName) {
        if (typeof this.eventHandlers[handlerName] == "function") {
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleEn() {        
        this.properties.en = !this.properties.en;
        recognizer.lang = this.properties.en ? 'en-US' : 'ru-Ru';
        for (const key of this.elements.keys) {
            if (key.textContent === "EN" || key.textContent === "RU") key.textContent = this.properties.en ? "EN" : "RU"; 
            if (key.textContent === "q" || key.textContent === "й") key.textContent = this.properties.en ? "q" : "й";
            if (key.textContent === "Q" || key.textContent === "Й") key.textContent = this.properties.en ? "Q" : "Й";
            if (key.textContent === "w" || key.textContent === "ц") key.textContent = this.properties.en ? "w" : "ц";
            if (key.textContent === "W" || key.textContent === "Ц") key.textContent = this.properties.en ? "W" : "Ц";
            if (key.textContent === "e" || key.textContent === "у") key.textContent = this.properties.en ? "e" : "у";
            if (key.textContent === "E" || key.textContent === "У") key.textContent = this.properties.en ? "E" : "У";
            if (key.textContent === "r" || key.textContent === "к") key.textContent = this.properties.en ? "r" : "к";
            if (key.textContent === "R" || key.textContent === "К") key.textContent = this.properties.en ? "R" : "К";
            if (key.textContent === "t" || key.textContent === "е") key.textContent = this.properties.en ? "t" : "е";
            if (key.textContent === "T" || key.textContent === "Е") key.textContent = this.properties.en ? "T" : "Е";
            if (key.textContent === "y" || key.textContent === "н") key.textContent = this.properties.en ? "y" : "н";
            if (key.textContent === "Y" || key.textContent === "Н") key.textContent = this.properties.en ? "Y" : "Н";
            if (key.textContent === "u" || key.textContent === "г") key.textContent = this.properties.en ? "u" : "г";
            if (key.textContent === "U" || key.textContent === "Г") key.textContent = this.properties.en ? "U" : "Г";
            if (key.textContent === "i" || key.textContent === "ш") key.textContent = this.properties.en ? "i" : "ш";
            if (key.textContent === "I" || key.textContent === "Ш") key.textContent = this.properties.en ? "I" : "Ш";
            if (key.textContent === "o" || key.textContent === "щ") key.textContent = this.properties.en ? "o" : "щ";
            if (key.textContent === "O" || key.textContent === "Щ") key.textContent = this.properties.en ? "O" : "Щ";
            if (key.textContent === "p" || key.textContent === "з") key.textContent = this.properties.en ? "p" : "з";
            if (key.textContent === "P" || key.textContent === "З") key.textContent = this.properties.en ? "P" : "З";
            if (key.textContent === "[" || key.textContent === "х") key.textContent = this.properties.en ? "[" : "х";
            if (key.textContent === "{" || key.textContent === "Х") key.textContent = this.properties.en ? "{" : "Х";
            if (key.textContent === "]" || key.textContent === "ъ") key.textContent = this.properties.en ? "]" : "ъ";
            if (key.textContent === "}" || key.textContent === "Ъ") key.textContent = this.properties.en ? "}" : "Ъ";
            if (key.textContent === "a" || key.textContent === "ф") key.textContent = this.properties.en ? "a" : "ф";
            if (key.textContent === "A" || key.textContent === "Ф") key.textContent = this.properties.en ? "A" : "Ф";
            if (key.textContent === "s" || key.textContent === "ы") key.textContent = this.properties.en ? "s" : "ы";
            if (key.textContent === "S" || key.textContent === "Ы") key.textContent = this.properties.en ? "S" : "Ы";
            if (key.textContent === "d" || key.textContent === "в") key.textContent = this.properties.en ? "d" : "в";
            if (key.textContent === "D" || key.textContent === "В") key.textContent = this.properties.en ? "D" : "В";
            if (key.textContent === "f" || key.textContent === "а") key.textContent = this.properties.en ? "f" : "а";
            if (key.textContent === "F" || key.textContent === "А") key.textContent = this.properties.en ? "F" : "А";
            if (key.textContent === "g" || key.textContent === "п") key.textContent = this.properties.en ? "g" : "п";
            if (key.textContent === "G" || key.textContent === "П") key.textContent = this.properties.en ? "G" : "П";
            if (key.textContent === "h" || key.textContent === "р") key.textContent = this.properties.en ? "h" : "р";
            if (key.textContent === "H" || key.textContent === "Р") key.textContent = this.properties.en ? "H" : "Р";
            if (key.textContent === "j" || key.textContent === "о") key.textContent = this.properties.en ? "j" : "о";
            if (key.textContent === "J" || key.textContent === "О") key.textContent = this.properties.en ? "J" : "О";
            if (key.textContent === "k" || key.textContent === "л") key.textContent = this.properties.en ? "k" : "л";
            if (key.textContent === "K" || key.textContent === "Л") key.textContent = this.properties.en ? "K" : "Л";
            if (key.textContent === "l" || key.textContent === "д") key.textContent = this.properties.en ? "l" : "д";
            if (key.textContent === "L" || key.textContent === "Д") key.textContent = this.properties.en ? "L" : "Д";
            if (key.textContent === ";" || key.textContent === "ж") key.textContent = this.properties.en ? ";" : "ж";
            if (key.textContent === ":" || key.textContent === "Ж") key.textContent = this.properties.en ? ":" : "Ж";
            if (key.textContent === "'" || key.textContent === "э") key.textContent = this.properties.en ? "'" : "э";
            if (key.textContent === "\"" || key.textContent === "Э") key.textContent = this.properties.en ? "\"" : "Э";
            if (key.textContent === "z" || key.textContent === "я") key.textContent = this.properties.en ? "z" : "я";
            if (key.textContent === "Z" || key.textContent === "Я") key.textContent = this.properties.en ? "Z" : "Я";
            if (key.textContent === "x" || key.textContent === "ч") key.textContent = this.properties.en ? "x" : "ч";
            if (key.textContent === "X" || key.textContent === "Ч") key.textContent = this.properties.en ? "X" : "Ч";
            if (key.textContent === "c" || key.textContent === "с") key.textContent = this.properties.en ? "c" : "с";
            if (key.textContent === "C" || key.textContent === "С") key.textContent = this.properties.en ? "C" : "С";
            if (key.textContent === "v" || key.textContent === "м") key.textContent = this.properties.en ? "v" : "м";
            if (key.textContent === "V" || key.textContent === "М") key.textContent = this.properties.en ? "V" : "М";
            if (key.textContent === "b" || key.textContent === "и") key.textContent = this.properties.en ? "b" : "и";
            if (key.textContent === "B" || key.textContent === "И") key.textContent = this.properties.en ? "B" : "И";
            if (key.textContent === "n" || key.textContent === "т") key.textContent = this.properties.en ? "n" : "т";
            if (key.textContent === "N" || key.textContent === "Т") key.textContent = this.properties.en ? "N" : "Т";
            if (key.textContent === "m" || key.textContent === "ь") key.textContent = this.properties.en ? "m" : "ь";
            if (key.textContent === "M" || key.textContent === "Ь") key.textContent = this.properties.en ? "M" : "Ь"; 
            if (key.textContent === "`" || key.textContent === "ё") key.textContent = this.properties.en ? "`" : "ё";
            if (key.textContent === "~" || key.textContent === "Ё") key.textContent = this.properties.en ? "~" : "Ё";                         
            if (key.textContent === "#" || key.textContent === "№") key.textContent = this.properties.en ? "#" : "№"; 
            if (key.textContent === "," || key.textContent === "б") key.textContent = this.properties.en ? "," : "б";
            if (key.textContent === "<" || key.textContent === "Б") key.textContent = this.properties.en ? "<" : "Б"; 
            if (key.textContent === "." || key.textContent === "ю") key.textContent = this.properties.en ? "." : "ю";
            if (key.textContent === ">" || key.textContent === "Ю") key.textContent = this.properties.en ? ">" : "Ю"; 
            if (!this.properties.capsLock) document.querySelector(".keyboard__key--dot-ru").innerHTML = this.properties.en ? "/" : ".";            
            if (this.properties.capsLock) document.querySelector(".keyboard__key--dot-ru").innerHTML = this.properties.en ? "?" : ","; 
            if (this.properties.capsLock) document.querySelector(".keyboard__key--2q-ru").innerHTML = this.properties.en ? "@" : "\"";
            if (this.properties.capsLock) document.querySelector(".keyboard__key--dq-ru").innerHTML = this.properties.en ? "$" : ";";
            if (this.properties.capsLock) document.querySelector(".keyboard__key--dd-ru").innerHTML = this.properties.en ? "^" : ":";
            if (this.properties.capsLock) document.querySelector(".keyboard__key--q-ru").innerHTML = this.properties.en ? "&" : "?";
        }

    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;        

        if (this.properties.capsLock) document.getElementById("keyboard__shift").disabled = 1;
        else document.getElementById("keyboard__shift").disabled = 0;

        for (const key of this.elements.keys) {
            if (key.childElementCount === 0 && key.textContent !== "Shift" && key.textContent !== "EN" && key.textContent !== "RU") {
                key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }            
        }
    },

    _toggleVoice() {
        this.properties.voice = !this.properties.voice;  
    },

    _toggleShift() {
        this.properties.shift = !this.properties.shift;    
        
        if (this.properties.shift) document.getElementById("keyboard__capslock").disabled = 1;
        else document.getElementById("keyboard__capslock").disabled = 0;

        for (const key of this.elements.keys) {
            if (key.childElementCount === 0 && key.textContent !== "Shift" && key.textContent !== "EN" && key.textContent !== "RU") {
                key.textContent = this.properties.shift ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }  
            if (key.textContent === "1" || key.textContent === "!") key.textContent = this.properties.shift ? "!" : "1";
            if (this.properties.en) {
                if (key.textContent === "3" || key.textContent === "#") key.textContent = this.properties.shift ? "#" : "3";
            }
            if (!this.properties.en) {
                if (key.textContent === "3" || key.textContent === "№") key.textContent = this.properties.shift ? "№" : "3";
            }
            if (key.textContent === "5" || key.textContent === "%") key.textContent = this.properties.shift ? "%" : "5";
            if (key.textContent === "8" || key.textContent === "*") key.textContent = this.properties.shift ? "*" : "8";
            if (key.textContent === "9" || key.textContent === "(") key.textContent = this.properties.shift ? "(" : "9";
            if (key.textContent === "0" || key.textContent === ")") key.textContent = this.properties.shift ? ")" : "0";           
            if (key.textContent === "," || key.textContent === "<") key.textContent = this.properties.shift ? "<" : ",";
            if (key.textContent === "." || key.textContent === ">") key.textContent = this.properties.shift ? ">" : ".";
            if (key.textContent === "en" || key.textContent === "ru") key.textContent = key.textContent.toUpperCase();
            if (key.textContent === "`" || key.textContent === "~") key.textContent = this.properties.shift ? "~" : "`";
            if (key.textContent === "-" || key.textContent === "_") key.textContent = this.properties.shift ? "_" : "-";
            if (key.textContent === "=" || key.textContent === "+") key.textContent = this.properties.shift ? "+" : "=";
            if (key.textContent === "[" || key.textContent === "{") key.textContent = this.properties.shift ? "{" : "[";
            if (key.textContent === "]" || key.textContent === "}") key.textContent = this.properties.shift ? "}" : "]";
            if (key.textContent === ";" || key.textContent === ":") key.textContent = this.properties.shift ? ":" : ";";
            if (key.textContent === "'" || key.textContent === "\"") key.textContent = this.properties.shift ? "\"" : "'";
            if (key.textContent === "\\" || key.textContent === "|") key.textContent = this.properties.shift ? "|" : "\\";
            if (this.properties.en) document.querySelector(".keyboard__key--dot-ru").innerHTML = this.properties.shift ? "?" : "/";            
            if (!this.properties.en) document.querySelector(".keyboard__key--dot-ru").innerHTML = this.properties.shift ? "," : "."; 
            if (this.properties.en) document.querySelector(".keyboard__key--2q-ru").innerHTML = this.properties.shift ? "@" : "2";
            if (!this.properties.en) document.querySelector(".keyboard__key--2q-ru").innerHTML = this.properties.shift ? "\"" : "2";
            if (this.properties.en) document.querySelector(".keyboard__key--dq-ru").innerHTML = this.properties.shift ? "$" : "4";
            if (!this.properties.en) document.querySelector(".keyboard__key--dq-ru").innerHTML = this.properties.shift ? ";" : "4";
            if (this.properties.en) document.querySelector(".keyboard__key--dd-ru").innerHTML = this.properties.shift ? "^" : "6";
            if (!this.properties.en) document.querySelector(".keyboard__key--dd-ru").innerHTML = this.properties.shift ? ":" : "6";
            if (this.properties.en) document.querySelector(".keyboard__key--q-ru").innerHTML = this.properties.shift ? "&" : "7";
            if (!this.properties.en) document.querySelector(".keyboard__key--q-ru").innerHTML = this.properties.shift ? "?" : "7";
        }
    },

    open(initialValue, oninput, onclose) {
        this.properties.value = initialValue || "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove("keyboard--hidden");
    },

    close() {
        this.properties.value = "";
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.add("keyboard--hidden");
    }
};

let abc = "qwertyuiopasdfghjklzxcvbnmzxcvbnm";
for (let char of abc) {
    document.addEventListener("keydown", function(event) {
        if (event.code == `Key${char.toUpperCase()}`) {        
            document.getElementById(`keyboard__${char}`).style.backgroundColor = "rgba(255, 255, 255, 0.4)";
            document.querySelector('audio').play();  
        }
      });
    document.addEventListener("keyup", function(event) {
        if (event.code == `Key${char.toUpperCase()}`) {        
            document.getElementById(`keyboard__${char}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        }
    });
}
let abc2 = "0123456789";
for (let char of abc2) {
    document.addEventListener("keydown", function(event) {
        if (event.code == `Digit${char.toUpperCase()}`) {        
            document.getElementById(`keyboard__${char}`).style.backgroundColor = "rgba(255, 255, 255, 0.4)";
            document.querySelector('audio').play();  
        }
      });
    document.addEventListener("keyup", function(event) {
        if (event.code == `Digit${char.toUpperCase()}`) {        
            document.getElementById(`keyboard__${char}`).style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        }
    });
}
document.addEventListener("keydown", function(event) {
    if (event.code == "Backquote") {        
        document.getElementById("keyboard__`").style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        document.querySelector('audio').play();  
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "Backquote") {        
        document.getElementById("keyboard__`").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "Minus") {        
        document.getElementById("keyboard__-").style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        document.querySelector('audio').play();  
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "Minus") {        
        document.getElementById("keyboard__-").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "Equal") {        
        document.getElementById("keyboard__=").style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        document.querySelector('audio').play();  
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "Equal") {        
        document.getElementById("keyboard__=").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "Backspace") {        
        document.getElementById("keyboard__backspace").style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        document.querySelector('audio').play();  
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "Backspace") {        
        document.getElementById("keyboard__backspace").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "BracketLeft") {        
        document.getElementById("keyboard__[").style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        document.querySelector('audio').play();  
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "BracketLeft") {        
        document.getElementById("keyboard__[").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "BracketRight") {        
        document.getElementById("keyboard__]").style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        document.querySelector('audio').play();  
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "BracketRight") {        
        document.getElementById("keyboard__]").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "CapsLock") {       
        document.getElementById("keyboard__capslock").style.backgroundColor = "rgba(255, 255, 255, 0.4)";  
        document.querySelector('audio').play();        
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "CapsLock") {        
        document.getElementById("keyboard__capslock").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "Semicolon") {       
        document.getElementById("keyboard__;").style.backgroundColor = "rgba(255, 255, 255, 0.4)"; 
        document.querySelector('audio').play();         
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "Semicolon") {        
        document.getElementById("keyboard__;").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "Quote") {       
        document.getElementById("keyboard__'").style.backgroundColor = "rgba(255, 255, 255, 0.4)";    
        document.querySelector('audio').play();      
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "Quote") {        
        document.getElementById("keyboard__'").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "Backslash") {       
        document.getElementById("keyboard__\\").style.backgroundColor = "rgba(255, 255, 255, 0.4)";   
        document.querySelector('audio').play();       
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "Backslash") {        
        document.getElementById("keyboard__\\").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "Comma") {       
        document.getElementById("keyboard__,").style.backgroundColor = "rgba(255, 255, 255, 0.4)";    
        document.querySelector('audio').play();      
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "Comma") {        
        document.getElementById("keyboard__,").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "Period") {       
        document.getElementById("keyboard__.").style.backgroundColor = "rgba(255, 255, 255, 0.4)";  
        document.querySelector('audio').play();        
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "Period") {        
        document.getElementById("keyboard__.").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "Slash") {       
        document.getElementById("keyboard__/").style.backgroundColor = "rgba(255, 255, 255, 0.4)";  
        document.querySelector('audio').play();        
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "Slash") {        
        document.getElementById("keyboard__/").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "Enter") {       
        document.getElementById("keyboard__enter").style.backgroundColor = "rgba(255, 255, 255, 0.4)";    
        document.querySelector('audio').play();      
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "Enter") {        
        document.getElementById("keyboard__enter").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "ArrowLeft") {       
        document.getElementById("keyboard__arrowleft").style.backgroundColor = "rgba(255, 255, 255, 0.4)"; 
        document.querySelector('audio').play();         
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "ArrowLeft") {        
        document.getElementById("keyboard__arrowleft").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "ArrowRight") {       
        document.getElementById("keyboard__arrowright").style.backgroundColor = "rgba(255, 255, 255, 0.4)"; 
        document.querySelector('audio').play();         
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "ArrowRight") {        
        document.getElementById("keyboard__arrowright").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "Space") {       
        document.getElementById("keyboard__space").style.backgroundColor = "rgba(255, 255, 255, 0.4)";  
        document.querySelector('audio').play();      
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "Space") {        
        document.getElementById("keyboard__space").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});
document.addEventListener("keydown", function(event) {
    if (event.code == "ShiftLeft" || event.code == "ShiftRight") {       
        document.getElementById("keyboard__shift").style.backgroundColor = "rgba(255, 255, 255, 0.4)";  
        document.querySelector('audio').play();      
    }
  });
document.addEventListener("keyup", function(event) {
    if (event.code == "ShiftLeft" || event.code == "ShiftRight") {        
        document.getElementById("keyboard__shift").style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    }
});



window.addEventListener("DOMContentLoaded", function () {
    Keyboard.init();
});