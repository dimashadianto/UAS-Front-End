var app = angular.module('countrypediaApp', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'view/home.html',
            controller: 'CountryController'
        })
        .when('/currency', {
            templateUrl: 'view/currency.html',
            controller: 'CountryController'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('CountryController', ['$scope', '$http', function($scope, $http) {
    $scope.currentPage = 1;
    $scope.countriesPerPage = 18;

    $http.get('https://restcountries.com/v3.1/all').then(function(response) {
        $scope.countries = response.data.map(country => {
            const currencyKey = country.currencies ? Object.keys(country.currencies)[0] : null;
            const currency = currencyKey ? country.currencies[currencyKey] : { name: 'N/A', symbol: 'N/A' };

            return {
                name: country.name.common,
                flag: country.flags.png,
                currencyName: currency.name,
                currencySymbol: currency.symbol,
                telCode: country.idd ? `${country.idd.root}${country.idd.suffixes[0]}` : 'N/A'
            };
        });

        $scope.totalPages = Math.ceil($scope.countries.length / $scope.countriesPerPage);
        updateCountriesList();
        updatePagination();
    });

    function updateCountriesList() {
        const startIndex = ($scope.currentPage - 1) * $scope.countriesPerPage;
        $scope.countriesToShow = $scope.countries.slice(startIndex, startIndex + $scope.countriesPerPage);
    }

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
    }

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
}]);
