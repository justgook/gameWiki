$.fn.serializeObject = function ()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] || o[this.name] == '') {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
(function ($) {
  // **ListView class**: Our main app view.
  var Wiki = Backbone.Model.extend({
    // urlRoot:"/data/wiki",
    defaults:{
      id: null,
      title: null,
      body: null
    },
  });
  //wiki collection
  var WikiList = Backbone.Collection.extend({
    model: Wiki,
    url: '/data/wiki'
  });


  // collection: WikiList,
  var WikiListView = Backbone.View.extend({
    template: "#WikiListView",
    collection: WikiList,
    initialize: function () {
      var that = this;
      this.template = Mustache.compile($(this.template)[0].innerHTML);
      this.listenTo(this.collection, "add", this.render);
      _.bindAll(this, 'render');
    },
    render: function () {
      var cTemplate = this.template({
        posts:this.collection.toJSON(),
        linkToTitle: function () {
          return "/wiki/"+ this.title + "-" + this.id;
        }
      });
      $(this.el).html(cTemplate);
    }
  });
  //TODO add BaseApplicationView to extend it
//View one wiki post
  var WikiItemView = Backbone.View.extend({
    // el:document.createDocumentFragment,
    template: "#WikiItemView",
    model:Wiki,
    initialize: function (args) {
      this.app = args.app;
      this.template = Mustache.compile($(this.template)[0].innerHTML);
      _.bindAll(this, 'render');
    },
    render: function () {
      // this.$("#wikiForm-preview").html();
      var data = this.model.toJSON();
      data.body = this.app.md2html(data.body);
      $(this.el).html(this.template(data));
    },
    changeModel: function (model) {
      this.model = model;
    }
  });

  //Modal box for create and update wiki posts
  var ModalBox = Backbone.View.extend({
    template:"#WikiCreate",
    model:Wiki,
    el: "#modal",
    events:{
      "submit form": "createWikiPost",
      'click [data-target="#wikiForm-preview"]' : "updatePreview"
    },
    changeModel: function (model) {
      this.model = model;
    },
    initialize:function (app) {
      var that = this;
      this.app = app.app;
      this.template = Mustache.compile($(this.template)[0].innerHTML);
      this.$el.on('hidden', function(){
        that.app.route.previous();
      });
      _.bindAll(this, 'render');
      _.bindAll(this, 'updatePreview');
    },

    updatePreview: function () {
      this.$("#wikiForm-preview").html(this.app.md2html(this.$("textarea:eq(0)").val()));
    },

    render: function() {
      var data = this.model ? this.model.toJSON() : {title:"", body:"", id:""};
      $(this.el).html(this.template(data));
      this.$el.modal({ dynamic: true });
    },

    createWikiPost: function (e) {
      var that = this;
      var data = $(e.target).serializeObject();

      var wikiModel = (this.model || new this.model).set(data);
      this.app.collection.add(wikiModel);
      wikiModel.save(null,{
        success : function (model, response) {
          that.$el.modal("hide");
        }
      });
      return false;
    }
  });

  //Router 
  var Router = Backbone.Router.extend({
    routes: {
      "":                     "wikiList",
      "wiki/:item":           "wikiItem",
      "create/wiki":          "wikiCreate",
      "wiki/edit/:item":      "wikiEdit"
    },
    app: null,
    initialize: function (app) {
      // console.log(this.route);
      // this.route(/^(.*?)(\?open)/mi, function(){alert();});
      // @on "all", @storeRoute
      this.on("route", this.storeRoute);
      this.history = [];
      this.app = app.app;
      this.modal = new ModalBox({app:this.app});
      this.app.collection = new WikiList;
    },
    // storeRoute: ->
    // @history.push Backbone.history.fragment
    storeRoute: function() {
      this.history.push(Backbone.history.fragment);
    },
    // previous: ->
    // if @history.length > 1
    //   @navigate @history[@history.length-2], false
    // else
    //   @navigate '', true
    previous: function(){
      if (history.length > 1){
        this.navigate(this.history[this.history.length-2], true);
      } else {
        this.navigate ('', true);
      }
    },
    wikiList: function wikiLiatRouter () {
      if (!this.app.views.listView) {
        this.app.views.listView = new WikiListView({collection:this.app.collection, el:this.app.containers.main});
        this.app.collection.fetch({
          success: this.app.views.listView.render
        });
      } else {
      this.app.views.listView.render();
      }
    },
    wikiItem: function wikiLiatRouter (id) {
      var that = this;
      var model = new Wiki({id:id});
      this.app.collection.add(model);
      if (!that.app.views.itemView) {
        that.app.views.itemView = new WikiItemView({model:model, el:that.app.containers.main, app: this.app});
      } else {
        that.app.views.itemView.changeModel(model);
      }
      model.fetch({
        success:that.app.views.itemView.render
      });
    },
    wikiCreate: function wikiCreatRouter () {
      this.modal.changeModel(null);
      this.modal.render();
    },
    wikiEdit: function wikiCreatRouter (item) {
      this.modal.changeModel(this.app.collection.get(item));
      this.modal.render();
    }
  });

  var AppView = Backbone.View.extend({
    events: {"click a": "selectNav"},
    views: {},
    el:document,
    selectNav: function (e) {
      var $target = $(e.target);
      $target.closest('ul').find('li.selected').removeClass("selected");
      $target.closest('li').addClass("selected");
    },
    initialize: function () {
      var converter = new Showdown.converter();
      this.md2html = converter.makeHtml;
      // alert(('#hello markdown!'));

      this.containers = {main: $("#content")};
      this.route = new Router({app:this});
      Backbone.history.start({ pushState: true});
      $(document).on("click.historyNav", "a[href]:not([data-bypass])", function (evt) {
        var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
        root = location.protocol + "//" + location.host + "/";
        if(href.prop.slice(0, root.length) === root) {
          evt.preventDefault();
          Backbone.history.navigate(href.attr, true);
          return false;
        }
      });
    }
  });
  $(function(){
    new AppView();
  });

})(jQuery);


