//common things
var csvJSON = function(csv) {
  var lines = csv.split("\r\n");
  var result = [];
  var headers=lines[0].split(giftConfig.fileSlice);
  for(var i=1;i<lines.length;i++){
      var obj = {};
      var currentline=lines[i].split(giftConfig.fileSlice);
      for(var j=0;j<headers.length;j++){
          obj[headers[j]] = currentline[j];
      }
      result.push(obj);
  }
  return JSON.stringify(result); //JSON
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) { return true; }
    }
    return false;
}

function parse(str) {
    var args = [].slice.call(arguments, 1),
    i = 0;
    return str.replace(/%s/g, function() {
        return args[i++];
    });
}



var giftConfig = {
	fileLocation: 'http://bicanc.github.io/giftfinder/anneler.csv',
	fileSlice: ';',
	filters: [
		{
			name: 'Yaş Seçimi',
			baslik : 'Kaç yaş için hediye arıyorsunuz?',
			fields: [],
			fieldsChecked: {},
			slice: ',' //içindekileri bölüp kategorize etmek lazım mı, lazımsa slice karakteri nedir.
		}, {
			name: 'Fiyat Aralığı',
			baslik : 'Hediye fiyat aralığı nedir?',
			fields: [],
			fieldsChecked: {},
			slice: false
		}, {
			name: 'Kategori',
			baslik : 'Hangi kategoriden hediye seçmek istersiniz?',
			fields: [],
			fieldsChecked: {},
			slice: false
		}
	],
	sorting : {
		price: { //bir tek fiyat küsüratlardan dolayı yeniden floata çevrildi yeni bir field ile
			name: 'floatPrice',
			text: 'En %s fiyat',
			ascending: true, //artan fiyat
			descending: true //azalan fiyat
		},
		discountRate : {
			name: 'discountRate',
			text: 'En %s indirim',
			descending: true //azalan indirim: en çok indirim
		},
		ratingScore: {
			name: 'ratingScore',
			text: 'En %s puan',
			descending: true //azalan puan: en çok puan
			
		},
		ratingCount: {
			name: 'ratingCount',
			text: 'En %s yorum alan',
			descending: true //azalan yorum: en çok yorum
		}
	}
};


var giftFinderApp = angular.module('giftFinderApp', []);

// create the controller and inject Angular's $scope
giftFinderApp.controller('mainController', function($scope, $http, $q) {
	$scope.products = []; //empty at the first place
	//var url = 'anneler.csv';
	$scope.filters = giftConfig.filters;


	var getProducts = function() {
		var products = null;
	    var deferred = $q.defer();
	    if (products !== null) deferred.resolve(products);
	    $http.get(giftConfig.fileLocation)
	    	.success(function(response) {
	      		deferred.resolve(response);
	    	})
	    	.error(deferred.reject);
	    return deferred.promise;
	}

	getProducts().then(function(response) {


		var products =  JSON.parse(csvJSON(response.toString()));

		

		


		Promise.resolve( response ).then(function(datta) {

			var jsoned = csvJSON(datta);

			console.log(jsoned);

			
			var products1 =  JSON.parse(csvJSON(datta)); //burada CALLBACK LAZIM SANKİ

			console.log(datta);
			console.log('data');
		});

		

		
		for(var i = 0; i < products.length; i++) { 
			//fiyatlardaki , ler . oluyor.
			products[i].ratingScore = parseFloat(products[i].ratingScore.replace(/,/, '.')); 
			products[i]['Fiyat Aralığı'] = products[i]['Fiyat Aralığı'].replace('TL', ' TL');
			products[i]['floatPrice'] = parseFloat(products[i]['price']);
			products[i]['discountRate'] = parseFloat(products[i]['discountRate']);
			products[i]['ratingCount'] = parseFloat(products[i]['ratingCount']);
			for (var ii = 0; ii < giftConfig.filters.length; ii++) { // her filtre için dönüyoruz
				var filtre_adi = giftConfig.filters[ii].name; //ör Yaş Seçimi [0], Fiyat Aralığı [1], Kategori [2]
				var filtre_slice = giftConfig.filters[ii].slice;
				if (filtre_slice) {
					var slicedArray = products[i][filtre_adi].split(filtre_slice);
					for(var iii = 0; iii < slicedArray.length; iii++) {
						if (!$scope.filters[ii].fields.contains(slicedArray[iii])) {
							$scope.filters[ii].fields.push(slicedArray[iii]);
							$scope.filters[ii].fieldsChecked[slicedArray[iii]] = false;
						}
					}
				}
				else {
					if (!$scope.filters[ii].fields.contains( products[i][filtre_adi] )) {
						$scope.filters[ii].fields.push( products[i][filtre_adi] );
						$scope.filters[ii].fieldsChecked[products[i][filtre_adi]] = false;
					}
				}
				urunun_filtre_adi = products[i][filtre_adi];
			}
		}
		//filtreleri sıralıyoruz
		$scope.filters[0].fields.sort();
		$scope.filters[1].fields.sort( function(a, b) { return a.split(' ')[0] - b.split(' ')[0] } ); //burada sıralama biraz farklı olması gerekti data'dan dolayı. fiyat sıralaması.
		$scope.filters[2].fields.sort();
		$scope.products = products; 

	 });




	$scope.predicate = 'price'; 
	$scope.reverse = true;
	$scope.sorting = function(sort) {
		if (!sort) return;

		if (sort.value != undefined || sort.ascdesc != undefined) {
			var value = sort.value;
			var ascdesc = sort.ascdesc;
			$scope.predicate = value;
			if (ascdesc == 'ascending') $scope.reverse = false;
			if (ascdesc == 'descending') $scope.reverse = true;
			//console.log($scope.predicate + ' . ' + $scope.reverse);
		}


	};
	$scope.sort = { };

	//$scope.customSorting = [{text:'Seçin',ascdesc:undefined, value:undefined}]; //sorting generator
	$scope.sortingFnc = function() {
		var sorting = giftConfig.sorting;
		$scope.customSorting = [];
		var count = 0;
		for (var key in sorting) {
			var sortingName, realfiltername;
			for (key2 in sorting[key]) {
				if (key2 == 'name') {
					realfiltername = sorting[key][key2];
				}
				else {
					if (key2 == 'text') {
						sortingName = sorting[key][key2];
					}
					else {
						var tmp = {};
						if (key2 == 'ascending') {
							tmp['text'] = parse(sortingName, 'düşük');
							tmp['ascdesc'] = 'ascending';
							tmp['value'] = realfiltername;
						}
						if (key2 == 'descending') {
							tmp['text'] = parse(sortingName, 'yüksek');
							tmp['ascdesc'] = 'descending';
							tmp['value'] = realfiltername;
						}
						$scope.customSorting.push(tmp);
					}
				}
			}
			count++;
		}
	}();
	$scope.pageSize = 20;
	$scope.pages = [];
	$scope.boundaryLinks = true;
	$scope.totalPages = 1;
	$scope.pagination = {
        last: 1,
        current: 1
    };
	$scope.range = {
        lower: 1,
        upper: 1,
        total: 1
    };
    $scope.directionLinks = true;
	$scope.setCurrent = function(num) {
        if (num <= $scope.totalPages && num >= 1) {
            $scope.pagination.current = num;
        }
    };
    $scope.filterClick = function() {
    	$scope.pagination.current = 1;
    };
    $scope.generatePagesArray = function (currentPage, collectionLength, rowsPerPage, paginationRange) {
        var totalPages = Math.ceil(collectionLength / rowsPerPage);
        var halfWay = Math.ceil(paginationRange / 2);
        var position;
        $scope.totalPages = totalPages;
        if (currentPage <= halfWay) {
            position = 'start';
        } else if (totalPages - halfWay < currentPage) {
            position = 'end';
        } else {
            position = 'middle';
        }
        $scope.pages = [];
        var ellipsesNeeded = paginationRange < totalPages;
        var i = 1;
        while (i <= totalPages && i <= paginationRange) {
            var pageNumber = calculatePageNumber(i, currentPage, paginationRange, totalPages);
            var openingEllipsesNeeded = (i === 2 && (position === 'middle' || position === 'end'));
            var closingEllipsesNeeded = (i === paginationRange - 1 && (position === 'middle' || position === 'start'));
            if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
                $scope.pages.push('...');
            } else {
                $scope.pages.push(pageNumber);
            }
            i ++;
        }

        return $scope.pages;
    }
	var calculatePageNumber = function(i, currentPage, paginationRange, totalPages) {
	    var halfWay = Math.ceil(paginationRange/2);
	    if (i === paginationRange) {
	        return totalPages;
	    } else if (i === 1) {
	        return i;
	    } else if (paginationRange < totalPages) {
	        if (totalPages - halfWay < currentPage) {
	            return totalPages - paginationRange + i;
	        } else if (halfWay < currentPage) {
	            return currentPage - halfWay + i;
	        } else {
	            return i;
	        }
	    } else {
	        return i;
	    }
	}
});

giftFinderApp.filter('itemsPerPage', function () {
    return function (products, scope) {
    	var predicate = scope.predicate;
    	var reverse = scope.reverse;
    	if (predicate) {
    		products.sort(function(a,b) {return (a[predicate] > b[predicate]) ? 1 : ((b[predicate] > a[predicate]) ? -1 : 0);} ); 
    		if (reverse) products.reverse();
    	}
		var newItems = [];
		var tmpItems = []; //de
		var productsLength = products.length;

		
		scope.pagination.last = Math.ceil(productsLength / scope.pageSize);
	    var begin = ((scope.pagination.current - 1) * scope.pageSize);
	    var end = begin + scope.pageSize;
	    for (var i = 0; i < productsLength; i++) {
			tmpItems.push(products[i]);
		}
	    filteredProducts = tmpItems.slice(begin, end);
		for (var i = 0; i < filteredProducts.length; i++) {
			newItems.push(filteredProducts[i]);
		}
		var tmpPages = scope.generatePagesArray(scope.pagination.current, productsLength, scope.pageSize, 7);
		return newItems;
    }
});  	


giftFinderApp.filter('ageFilter', function () {
    return function (products, filters) {
        var newItems = [];
        for (var i = 0; i < products.length; i++) { //tüm ürünleri dönerken;
        	currentFilter = filters.name;
        	filterSlice = filters.slice;
        	productFilterField = products[i][currentFilter]; //fieldschecked
        	selectedFilter = filters.fieldsChecked[productFilterField];
        	if(selectedFilter == undefined) { // virgüllü ya da sorunlu bir durum varsa.
	            if (filterSlice) {
					var sliceArray = productFilterField.split(filterSlice);
					for(var iii = 0; iii < sliceArray.length; iii++) {
						sliced = sliceArray[iii];
						selectedFilter = filters.fieldsChecked[sliced];
						if (selectedFilter == true) { 
			            	if (!newItems.contains(products[i])) {
			            		newItems.push(products[i]);
			            	}
			            }
					}
				}
        	}
        	if (selectedFilter == true) { 
            	if (!newItems.contains(products[i])) {
            		newItems.push(products[i]);
            	}
            }
        };
        return newItems;
    }
});

giftFinderApp.filter('priceFilter', function () {
    return function (products, filters) {
        var newItems = [];
        for (var i = 0; i < products.length; i++) {
			currentFilter = filters.name;
	    	productFilterField = products[i][currentFilter]; //fieldschecked
	    	selectedFilter = filters.fieldsChecked[productFilterField];
        	if (selectedFilter == true) { 
            	if (!newItems.contains(products[i])) {
            		newItems.push(products[i]);
            	}
            }
	    }
        return newItems;
    }
});
giftFinderApp.filter('categoryFilter', function () {
    return function (products, filters) {
        var newItems = [];
        for (var i = 0; i < products.length; i++) {
			currentFilter = filters.name;
	    	productFilterField = products[i][currentFilter]; //fieldschecked
	    	selectedFilter = filters.fieldsChecked[productFilterField];
        	if (selectedFilter == true) { 
            	if (!newItems.contains(products[i])) {
            		newItems.push(products[i]);
            	}
            }
	    }
        return newItems;
    }
});

giftFinderApp.directive('bapp', function(){
	return {
		restrict : 'E',
		templateUrl: 'http://bicanc.github.io/giftfinder/skeleton.html',
		link: function(scope, element) {
	        element.addClass('bootstraping');
	    }
	}
});

giftFinderApp.config(function($sceProvider) {
  $sceProvider.enabled(false);
});


angular.element(document).ready(function() {
	angular.bootstrap(document, ['giftFinderApp']);
});


