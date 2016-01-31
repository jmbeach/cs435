function Navbar() {
    this.brand = "Template";
    this.pages =
        [
            new Page("Home", "/", ""),
            new Page("Etc", "/etc", "/etc"),
        ];
}

function Page(_name, _url, _sref) {
    this.name = _name;
    this.url = _url;
    this.sref = _sref;
}
Page.prototype.isActive = function () {
    return window.location.pathname == this.url;
}
