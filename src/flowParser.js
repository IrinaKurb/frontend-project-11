const parser = (data) => {
    const DOMParserObj = new DOMParser();
    const doc = DOMParserObj.parseFromString(data, 'text/html');
    console.log(doc);
    const itemElements = doc.querySelectorAll('item');
    const result = Array.from(itemElements).reduce((acc, item) => {
        console.log(item);
        const resObj = {
            title: item.querySelector('title').textContent,
            link: item.getElementsByTagName('link').textContent,
            description: item.querySelector('description').textContent,
        };
        // console.log(resObj);
        return [...acc, resObj];
    }, []);
    return result;
};

export default parser;
