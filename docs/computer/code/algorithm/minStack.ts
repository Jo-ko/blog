class MinStack<T> {
   protected data: Array<T>;
   protected min: Array<T>;

   constructor() {
       this.data = [];
       this.min = [];
   }

   public push(ele: T) {
       this.data.push(ele);
       if (this.min.length) {
           const currentMin = this.min[this.min.length - 1];
           this.min.push(currentMin > ele ? ele : currentMin);
       } else {
           this.min.push(ele);
       }
   }

   public pop() {
       this.min.pop();
       return this.data.pop();
   }

   public clear() {
       this.data = [];
       this.min = [];
   }

   public isEmpty() {
       return !!this.data.length;
   }
}
