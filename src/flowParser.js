const parser = (data) => {
    // console.log(data);
    const contents = data['contents'];
    const DOMParserObj = new DOMParser();
    const doc = DOMParserObj.parseFromString(contents, 'text/xml');

    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
        const parseError = new Error('The XML parser does not represent well-formed XML!');
        throw parseError;
    }

    const channel =  doc.querySelector('channel');
    const feed = {
        channelTitle: channel.querySelector('title').textContent,
        channelDescription: channel.querySelector('description').textContent,
    };

    const itemElements = doc.querySelectorAll('item');
    const posts = Array.from(itemElements).reduce((acc, item) => {
        // console.log(item);
        const resObj = {
            title: item.querySelector('title').textContent,
            link: item.querySelector('link').textContent,
            description: item.querySelector('description').textContent,
        };
        return [...acc, resObj];
    }, []);
    return {
        posts,
        feed,
    };
};

export default parser;
