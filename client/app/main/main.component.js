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
  uuid = '';
  loadingLocation = false;
  loadingTrends = false;
  loadingGifs = false;
  nothingFound = false;

  /*@ngInject*/
  constructor($http, $scope, $window, socket, localStorageService) {
    this.$http = $http;
    this.$window = $window;
    this.socket = socket;
    this.localStorageService = localStorageService;

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('thing');
    });

    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('gif');
    });
  }

  $onInit() {
    if(this.getItemFromLocalStorage('uuid') === null) {
      this.$http.get('/api/gifs/uuid/1')
        .then(res => {
          console.log(res);
          this.submitToLocalStorage('uuid', res.data);
        });
    }

    this.uuid = this.getItemFromLocalStorage('uuid');
    this.$http.get(`/api/gifs/${this.uuid}`)
      .then(response => {
        this.loaded = true;
        this.savedGifs = response.data;
        this.socket.syncUpdates('gif', this.savedGifs);
        this.setRandomBackground();
      });

    this.$http.get('/api/things')
      .then(response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings);
      });

    this.getPlacesByLocation();
    if(this.isMobile()) {
      this.shakeReload();
    }
  }

  isMobile() {
    var check = false;
    (function(a) {
      if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  }

  submitToLocalStorage(key, val) {
    return this.localStorageService.set(key, val);
  }

  getItemFromLocalStorage(key) {
    return this.localStorageService.get(key);
  }

  shakeReload() {
    window.ondevicemotion = event => {
      var accX = Math.round(event.accelerationIncludingGravity.x * 10) / 10;
      var accY = Math.round(event.accelerationIncludingGravity.y * 1);

      if(accY > 50 || accX > 50) {
        this.$window.location.reload();
      }
    };
  }

  getGifs(trend) {
    if(this.search === '') {
      this.search = trend;
    }
    let searchTerms = this.search.split(',').map(function(item) {
      return item
        .replace(/\s/g, '+')
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
      uuid: this.uuid,
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

  deleteGif(gif, index) {
    this.$http.delete(`/api/gifs/${gif._id}`).then(res => {
      console.log(res);
      this.savedGifs.splice(index, 1);
    }, err => {
      if(err) {
        console.log(err);
      }
    });
  }

  shareGif(gif) {
    console.log(gif);
    let gifUrl = '';
    let associatedTrend = '';

    if(gif.gif === undefined) {
      console.log('undefined');
      gifUrl = gif.bitly_url;
    } else {
      gifUrl = gif.gif.bitly_url;
      associatedTrend = gif.associatedTrend.replace(/\s/g, '');
    }

    const url = `http://twitter.com/share?text=Oi&url=${gifUrl}&hashtags=${associatedTrend}`;
    this.$window.open(url, '_blank');
  }

  setRandomBackground() {
    if(this.savedGifs.length > 0) {
      const elements = angular.element(document.getElementsByClassName('hero-unit'));

      angular.forEach(elements, value => {
        const element = angular.element(value);
        const item = this.savedGifs[Math.floor(Math.random() * this.savedGifs.length)];

        element.css('background-image', `url('${item.gif.images.original.url}')`);
      });
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
