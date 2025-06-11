//内部使用了贪心 + 二分查找 + 回溯 算法
export function getSequence(arr) {
    const result = [0];
    const p = result.slice(0);
    let start
    let end;
    let middle;
    const len = arr.length
    for (let i = 0; i < len; i++) {
        const arrI = arr[i]
        if (arrI !== 0) {
            //为了vue3而处理掉数组中0的情况
            //拿出结果对应的最后一项，和我当前的这一项来做对比
            let resultLastIndex = result[result.length - 1];
            if (arr[resultLastIndex] < arrI) {
                p[i] = result[result.length - 1];//正常放入的时候，前一个节点索引就是result中的最后一个
                result.push(i);//直接将当前的索引放入到结果集中即可
                continue;
            }
        }
        start = 0;
        end = result.length - 1;
        while (start < end) {//二分查找
            middle = ((start + end) / 2) | 0;
            if (arr[result[middle]] < arrI) {
                start = middle + 1;
            } else {
                end = middle;
            }
        }
        if (arrI < arr[result[result[start]]]) {
            p[i] = result[start - 1];
            result[start] = i;
        }
    }
    //p为前驱界节点的列表，需要根据最后一个节点做追溯
    let l = result.length;
    let last = result[l - 1];//取出最后一项
    while (l-- > 0) {
        //倒序向前找，因为p的列表是前驱节点
        result[l] = last;
        last = p[last];//在数组中找到最后一个
    }
    //需要创建一个前驱节点，进行倒序追溯 （因为最后一项，可到是不会错的）
    return result;
}