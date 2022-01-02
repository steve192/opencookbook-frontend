export default ({config}) => {
  const currentdate = new Date();
  const now = currentdate.getDate() + '/' +
                (currentdate.getMonth()+1) + '/' +
                currentdate.getFullYear() + ' @ ' +
                currentdate.getHours() + ':' +
                currentdate.getMinutes() + ':' +
                currentdate.getSeconds();
  return {
    ...config,
    extra: {
      buildTime: now,
      defaultApiUrl: process.env.DEFAULT_API_URL,
    },
  };
};
