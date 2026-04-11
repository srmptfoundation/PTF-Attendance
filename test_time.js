const { format } = require('date-fns');
console.log(format(new Date(), 'yyyy-MM-dd'));
console.log(new Date().toISOString().split('T')[0]);
