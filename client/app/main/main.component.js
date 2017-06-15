import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {
  giphyApiKey = 'dc6zaTOxFJmzC';
  activeTrend = '';
  awesomeThings = [];
  gifs = [];
  savedGifs = [];
  locations = [];
  trends = [];
  search = '';
  newThing = '';
  loadingLocation = false;
  loadingTrends = false;
  loadingGifs = false;
  nothingFound = false;

loaded = false;
  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('thing');
    });

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('gif');
    });
  }

  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings);
      });

    this.$http.get('/api/gifs')
      .then(response => {
        console.log(response);
        this.loaded = true;
        this.savedGifs = response.data;
        this.socket.syncUpdates('gif', this.savedGifs);
      });

    this.getPlacesByLocation();
  }

  getGifs(trend) {
    if(this.search === '') {
      this.search = trend;
    }
    let searchTerms = this.search.split(',').map(function(item) {
      return item
        .replace(' ', '+')
        .replace('#', '')
        .trim();
    });

    this.activeTrend = searchTerms.toString();
    this.gifs = [];
    this.loadingGifs = true;
    this.$http.get(`/api/gifs/get_gifs/${JSON.stringify(searchTerms)}`)
      .then(response => {
        this.search = '';
        this.loadingGifs = false;

        if(response.data.length === 0) {
          this.nothingFound = true;

          return;
        }

        this.nothingFound = false;
        this.gifs = response.data;
        console.log(response);
      });
  }

  getPlacesByLocation() {
    this.loadingLocation = true;
    this.locations = [];
    this.trends = [];

    // Get the location.
    navigator.geolocation.getCurrentPosition(position => {
      // Get the positioning coordinates.
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      this.$http.get(`/api/twitter/places/${lat}/${lng}`)
        .then(response => {
          this.loadingLocation = false;
          this.locations = response.data;
          console.log(response);
        });
    });
  }

  getTrendsByPlace(woeid) {
    this.loadingTrends = true;
    this.$http.get(`/api/twitter/trends/${woeid}`)
      .then(response => {
        console.log(response);
        this.loadingTrends = false;
        this.trends = response.data[0].trends;
      });
  }

  getGifByTrend(trend) {
    this.getGifs(trend);
  }

  saveGif(gif) {
    const saveGif = {
      name: gif.slug,
      associatedTrend: this.activeTrend,
      gif
    };

    this.$http.post('/api/gifs', saveGif).then(res => {
      this.savedGifs.push(res.data);
    }, err => {
      if(err) {
        console.log(err);
      }
    });
  }

  shareGif(gif) {
    console.log(gif);
  }

  getRandomBackground() {
    if(!this.savedGifs.length === 0) {
      const item = this.savedGifs[Math.floor(Math.random() * this.savedGifs.length)];

      return `url('${item.gif.images.original.url}')`;
    }
  }

  addThing() {
    if(this.newThing) {
      this.$http.post('/api/things', {
        name: this.newThing
      });
      this.newThing = '';
    }
  }

  deleteThing(thing) {
    this.$http.delete(`/api/things/${thing._id}`);
  }
}

export default angular.module('gifMeMoreApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
