var app = angular.module('countrypediaApp', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'view/home.html',
            controller: 'CountryController'
        })
        .when('/details/:countryName',{
            templateUrl: '/view/details.html',
            controller: 'CountryDetailsController'
        })
        .when('/currency', {
            templateUrl: 'view/currency.html',
            controller: 'CurrencyController'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('CountryController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.currentPage = 1;
    $scope.countriesPerPage = 18;
    $scope.searchQuery = '';
    $scope.searchType = 'name';
    $scope.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    $scope.dropdownVisible = false;

    $scope.toggleFilters = function() {
        $scope.dropdownVisible = !$scope.dropdownVisible;
    };

    $http.get('https://restcountries.com/v3.1/all').then(function(response) {
        $scope.countries = response.data;
        $scope.totalPages = Math.ceil($scope.countries.length / $scope.countriesPerPage);
        updateCountriesList();
        updatePagination();
    });

    function updateCountriesList() {
        const startIndex = ($scope.currentPage - 1) * $scope.countriesPerPage;
        $scope.countriesToShow = $scope.countries.slice(startIndex, startIndex + $scope.countriesPerPage);
    };

    function updatePagination() {
        const total = $scope.totalPages;
        const current = $scope.currentPage;
        $scope.pagesToShow = [];

        if (total <= 10) {
            $scope.pagesToShow = Array.from({ length: total }, (_, i) => i + 1);
        } else {
            if (current <= 3) {
                $scope.pagesToShow = [1, 2, 3, '...', total - 2, total - 1, total];
            } else if (current >= total - 2) {
                $scope.pagesToShow = [1, 2, 3, '...', total - 2, total - 1, total];
            } else {
                $scope.pagesToShow = [1, '...', current - 1, current, current + 1, '...', total];
            }
        }
    };

    $scope.goToPage = function(page) {
        if (page >= 1 && page <= $scope.totalPages) {
            $scope.currentPage = page;
            updateCountriesList();
            updatePagination();
        }
    };

    $scope.prevPage = function() {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
            updateCountriesList();
            updatePagination();
        }
    };

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
            updateCountriesList();
            updatePagination();
        }
    };

    $scope.searchCountry = function() {
        let url;
        if ($scope.searchQuery) {
            if ($scope.searchType === 'name') {
                url = `https://restcountries.com/v3.1/name/${$scope.searchQuery}`;
            } else if ($scope.searchType === 'code') {
                url = `https://restcountries.com/v3.1/alpha/${$scope.searchQuery}`;
            }
        } else {
            url = 'https://restcountries.com/v3.1/all';
        }
    
        $http.get(url).then(function(response) {
            if ($scope.searchQuery && $scope.searchType === 'name') {
                $scope.countries = response.data.filter(function(country) {
                    return country.name.common.toLowerCase().includes($scope.searchQuery.toLowerCase());
                });
            } else {
                $scope.countries = response.data;
            }
            
            $scope.totalPages = Math.ceil($scope.countries.length / $scope.countriesPerPage);
            $scope.currentPage = 1;
            updateCountriesList();
            updatePagination();
        }).catch(function(error) {
            alert('Country "' + $scope.searchQuery + '" not found. Please try again.');
        });
    };    

    $scope.filterByLetter = function(letter) {
        $http.get('https://restcountries.com/v3.1/all').then(function(response) {
            $scope.countries = response.data.filter(function(country) {
                return country.name.common.charAt(0).toUpperCase() === letter;
            });

            if ($scope.countries.length === 0) {
                $scope.errorMessage = `No countries found starting with the letter "${letter}".`;
            } else {
                $scope.errorMessage = '';
            }

            $scope.totalPages = Math.ceil($scope.countries.length / $scope.countriesPerPage);
            $scope.currentPage = 1;
            updateCountriesList();
            updatePagination();
        });
    };
    
    $scope.viewDetails = function (countryName){
        $location.path(`/details/${countryName}`);
    };

    $scope.filterByName = function(order) {
        if (order === 'asc') {
            $scope.countries.sort((a, b) => a.name.common.localeCompare(b.name.common)); // A-Z
        } else if (order === 'desc') {
            $scope.countries.sort((a, b) => b.name.common.localeCompare(a.name.common)); // Z-A
        }
        updateCountriesList();
    };

    $scope.filterByCode = function(order) {
        if (order === 'asc') {
            $scope.countries.sort((a, b) => a.ccn3 - b.ccn3); // Smallest to Largest
        } else if (order === 'desc') {
            $scope.countries.sort((a, b) => b.ccn3 - a.ccn3); // Largest to Smallest
        }
        updateCountriesList();
    };

    $scope.filterByPopulation = function(order) {
        if (order === 'asc') {
            $scope.countries.sort((a, b) => a.population - b.population); // Smallest to Largest
        } else if (order === 'desc') {
            $scope.countries.sort((a, b) => b.population - a.population); // Largest to Smallest
        }
        updateCountriesList();
    };

    function updateCountriesList() {
        const startIndex = ($scope.currentPage - 1) * $scope.countriesPerPage;
        $scope.countriesToShow = $scope.countries.slice(startIndex, startIndex + $scope.countriesPerPage);
    }
    
}]);

app.controller('CountryDetailsController', ['$scope', '$routeParams', '$http', '$location', function ($scope, $routeParams, $http, $location) {
    const countryName = $routeParams.countryName;

    $http.get(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`)
        .then(function (response) {
            if (response.data && response.data.length > 0) {
                $scope.country = response.data[0];
                $scope.selectedLang = null;

                const countryCcn3 = $scope.country.ccn3;

                if (countryCcn3) {
                    $http.get(`http://api.geonames.org/countryInfoJSON?username=dimashadianto`)
                        .then(function (geoResponse) {
                            const geoCountries = geoResponse.data.geonames;

                            const matchedCountry = geoCountries.find(c => c.isoNumeric === countryCcn3);

                            if (matchedCountry) {
                                const geonameId = matchedCountry.geonameId;

                                $http.get(`http://api.geonames.org/childrenJSON?geonameId=${geonameId}&username=dimashadianto`)
                                    .then(function (childrenResponse) {
                                        if (childrenResponse.data && childrenResponse.data.geonames) {
                                            $scope.provinces = childrenResponse.data.geonames;

                                            if ($scope.provinces.length <= 10) {
                                                $scope.gridColumns = 1;
                                            } else {
                                                $scope.gridColumns = 2;
                                            }
                                            
                                        } else {
                                            $scope.provinces = [];
                                            console.warn('No provinces found for this country.');
                                        }
                                    })
                                    .catch(function (error) {
                                        console.error('Error fetching provinces:', error);
                                        $scope.provinces = [];
                                    });
                            } else {
                                console.warn('No matching country found in GeoNames for ccn3:', countryCcn3);
                                $scope.provinces = [];
                            }
                        })
                        .catch(function (error) {
                            console.error('Error fetching country info from GeoNames:', error);
                            $scope.provinces = [];
                        });
                } else {
                    console.warn('ccn3 not available for this country.');
                    $scope.provinces = [];
                }
            } else {
                alert('Country details not found.');
                $location.path('/');
            }
        })
        .catch(function (error) {
            alert('Error fetching country details.');
            $location.path('/');
        });

    $scope.goBack = function () {
        $location.path('/');
    };
}]);

app.controller('CurrencyController', ['$scope', '$http', function ($scope, $http) {
    $scope.currentPage = 1;
    $scope.countriesPerPage = 10;
    $scope.countries = [];
    $scope.countriesToShow = [];
    $scope.pagesToShow = [];
    $scope.totalPages = 0;

    $scope.loading = true;
    $scope.error = null;

    $http.get('https://restcountries.com/v3.1/all')
        .then(function (response) {
            $scope.countries = response.data.map(country => {
                const currencyKey = country.currencies ? Object.keys(country.currencies)[0] : null;
                const currency = currencyKey ? country.currencies[currencyKey] : { name: 'N/A', symbol: 'N/A' };

                return {
                    name: country.name?.common || 'Unknown',
                    flag: country.flags?.png || 'https://via.placeholder.com/50',
                    currencyName: currency.name || 'N/A',
                    currencySymbol: currency.symbol || 'N/A',
                    telCode: country.idd?.root && country.idd.suffixes?.length
                        ? `${country.idd.root}${country.idd.suffixes[0]}`
                        : 'N/A',
                };
            });
            $scope.totalPages = Math.ceil($scope.countries.length / $scope.countriesPerPage);
            $scope.updateCountriesList();
            $scope.updatePagination();
            $scope.loading = false;
        })
        .catch(function (error) {
            $scope.error = "Could not load currency data.";
            $scope.loading = false;
            console.error(error);
        });

    $scope.updateCountriesList = function () {
        const startIndex = ($scope.currentPage - 1) * $scope.countriesPerPage;
        $scope.countriesToShow = $scope.countries.slice(startIndex, startIndex + $scope.countriesPerPage);
    };

    $scope.updatePagination = function () {
        const total = $scope.totalPages;
        const current = $scope.currentPage;
        $scope.pagesToShow = [];

        if (total <= 10) {
            $scope.pagesToShow = Array.from({ length: total }, (_, i) => i + 1);
        } else {
            if (current <= 3) {
                $scope.pagesToShow = [1, 2, 3, '...', total];
            } else if (current >= total - 2) {
                $scope.pagesToShow = [1, '...', total - 2, total - 1, total];
            } else {
                $scope.pagesToShow = [1, '...', current - 1, current, current + 1, '...', total];
            }
        }
    };

    $scope.goToPage = function (page) {
        if (page >= 1 && page <= $scope.totalPages) {
            $scope.currentPage = page;
            $scope.updateCountriesList();
            $scope.updatePagination();
        }
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
            $scope.updateCountriesList();
            $scope.updatePagination();
        }
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.currentPage++;
            $scope.updateCountriesList();
            $scope.updatePagination();
        }
    };
}]);