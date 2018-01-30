var vue = new Vue({
    el: '#editor',
    data: {
        input: ""
    },
    computed: {
        compiledMarkdown: function () {
            return marked(this.input, { sanitize: true })
        }
    },
    methods: {
        update: _.debounce(function (e) {
            this.input = e.target.value
        }, 300)
    }
});

function save() {
    if (document.getElementById("title").innerHTML === "Новый файл")
        name = "";
    else
        name = document.getElementById("title").innerHTML;
    var text = document.getElementById("text").value;
    $.ajax({
        type: 'POST',
        url: '/save',
        data: {
            data: text,
            name: name
        },
        success: function (response) {
            vue.input = "";
            document.getElementById("title").innerHTML = "Новый файл";
            if (name === "") {
                var a = document.createElement("a");
                a.setAttribute("href", "javascript:get('" + response + "');");
                a.innerHTML = response;
                document.getElementById("docs").appendChild(a);
                var br = document.createElement("br");
                document.getElementById("docs").appendChild(br);
            }
        }
    });
}

function find() {
    $.ajax({
        type: 'POST',
        url: '/find',
        success: function (response) {
            var documents = response.split('\n');
            documents.pop();
            documents.unshift("Новый файл");
            var HTML = "";
            for (var i = 0; i < documents.length; i++) {
                HTML += "<a href=\"javascript:get('" + documents[i] + "');\">" + documents[i] + "</a><br />";
            }
            document.getElementById("docs").innerHTML = HTML;
        }
    });
}

function get(name) {
    if (name === "Новый файл") {
        document.getElementById("title").innerHTML = "Новый файл";
        vue.input = "";
    } else {
        $.ajax({
            type: 'GET',
            url: '/get',
            data: {
                data: name
            },
            success: function (response) {
                document.getElementById("text").value = response;
                vue.input = response;
                document.getElementById("title").innerHTML = name;
            }
        });
    }
}
function remove() {
    if (document.getElementById("title").innerHTML !== "Новый файл") {
        name = document.getElementById("title").innerHTML;
        $.ajax({
            type: 'POST',
            url: '/remove',
            data: {
                name: name
            },
            success: function (response) {
                vue.input = "";
                document.getElementById("title").innerHTML = "Новый файл";
                for (var i = 0; i < document.getElementById("docs").children.length; i++) {
                    if (document.getElementById("docs").children[i].innerHTML === name) {
                        document.getElementById("docs").removeChild(document.getElementById("docs").children[i + 1]);
                        document.getElementById("docs").removeChild(document.getElementById("docs").children[i]);
                    }
                }
            }
        });
    }
}