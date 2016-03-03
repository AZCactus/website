//contains elb values

module.exports = function(){

    var userServiceURL;
    var blogServiceURL;
    var contentServiceURL;
    switch(process.env.NODE_ENV || 'development'){// other option is export NODE_ENV=development in console
        case 'development':
            userServiceURL = "http://localhost:9000/userService/";
            // userServiceURL = "http://192.168.2.130:9000/userService/";
            break;

        case 'production':
            userServiceURL = "http://"
            break;

        default:

    }
     return {

       'userService.ping': userServiceURL+'ping',
       'userService.create': userServiceURL+'create',
       'userService.createCustomer': userServiceURL+'createCustomer',
       'userService.resetPassword': userServiceURL+'resetPassword',
       'userService.login': userServiceURL+'login',
       'userService.updateCustomerData': userServiceURL+'updateCustomerData',
       'userService.logout': userServiceURL+'logout',
       'userService.findByMobile': userServiceURL+'findByMobile',
       'userService.findCustomerByCustomerId': userServiceURL+'findCustomerByCustomerId',
       'userService.updatePassword': userServiceURL+'updatePassword'

    };
};


