
const queue = [];//缓存当前要执行的队列
let isFlushing = false;
const resovePromise = Promise.resolve();


//如果同时在一个组件中更新多个状态，job是同一个
//同时开启一个异步任务
export function queueJob(job) {
    if(!queue.includes(job)){
        queue.push(job);//让任务入队列
    }
    if(!isFlushing){
        isFlushing = true;
        resovePromise.then(() => {
            isFlushing = false;
            const copy = queue.slice(0);//先拷贝在执行
            queue.length = 0;
            copy.forEach((job) => job());
        });
    }
}
//通过事件环的机制，延迟更新操作 