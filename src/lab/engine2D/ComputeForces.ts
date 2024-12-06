
// limitations under the License.

import { Random } from '../util/Random.js';
import { UtilEngine } from './UtilEngine.js';
import { Util } from '../util/Util.js';

/** Specifies the contact ordering policy: the order in which contacts are handled
by {@link ComputeForces}.
*/
export const enum NextContactPolicy {
  /** chooses the contact with the most negative acceleration, treating Joints first. 
  */
  MIN_ACCEL = 1,
  /** chooses contacts in random order, but treats Joints first. */
  RANDOM = 2,
  /** chooses contacts according to a pre-arranged ordering given by the 'preOrder'
  * list of contact numbers, but treats Joints first
  */
  PRE_ORDERED = 3,
  /** chooses the contact with the most negative acceleration, except Joints are
  * treated first in random order.
  */
  HYBRID = 4,
}


/** Computes forces at contact points between RigidBodys, or impulses at collision
points between RigidBodys. The {@link compute_forces} method is an implementation of
the algorithm given in the paper

+ *Fast contact force computation for nonpenetrating rigid bodies* by David Baraff,
Computer Graphics Proceedings, Annual Conference Series: 23-34, 1994. 12 pages.

More info at:

+ [2D Physics Engine Overview](../Engine2D.html)

+ [The Math and Physics Underlying ContactSim](https://www.myphysicslab.com/contact.html)

+ {@link lab/engine2D/ContactSim.ContactSim | ContactSim}

+ {@link lab/engine2D/ImpulseSim.ImpulseSim | ImpulseSim}

This documentation is written assuming that *contact forces* and resulting accelerations
are being calculated, but everything applies equally when calculating multiple
simultaneous *collision impulses* and resulting velocities.

### Terminology

This documentation uses several terms from the Baraff paper, such as C, NC, Acc.
See that paper for precise definitions. Roughly these are:

+ C is the set of contacts that have some force applied and zero acceleration

+ NC is the set of contacts that have no force applied because they are separating (they
have negative acceleration)

+ Acc is the subset of the A matrix corresponding to just the the set of contacts C

The algorithm starts with both C and NC being empty. We then examine one contact at a
time, moving it into C or NC, and possibly moving existing contacts between C and NC as
necessary.

### Constraints

The acceleration of the gap distance at each contact point is given by
```text
a = A f + b
a = acceleration of the gap (positive means gap is tending to widen)
A = n x n matrix where A[i,j] = change in acceleration at contact i resulting from
  force of 1 being applied at contact j
f = force applied at each contact (vector, length n)
b = external and inertial forces in the system (vector, length n)
n = number of contacts
```
We find forces such that
```text
0 <= A f + b
f . a = 0
```
The first condition ensures that acceleration is non-negative, so that bodies are not
accelerating into each other: contact forces can only push, never pull. The second
condition means that either

+ the force at a contact is zero and acceleration is positive (contacts are separating),
  or
+ the force at a contact is positive and acceleration is zero

### Joints

Joints are contact points that can both push and pull, and which never break their
contact. Regular contact points can only push, and the contact is broken if the
objects move apart. Joints are called 'bilateral constraints' in the Baraff paper.

Joints have different constraints: the force can be be positive or negative, but the
acceleration is always exactly zero.

### Return Value

The return value from {@link compute_forces} is `-1` if successful,
meaning that a set of forces were found so that the acceleration satisfies the above
constraints. If not successful, the caller can check the set of forces that were
calculated to see if the resulting acceleration at each contact point is still
acceptable.

See the method {@link checkForceAccel} for how to check the
accelerations. For example, the following code calculates and checks the acceleration
from the calculated forces.
```js
const error = computeForces.compute_forces(A, f, b, joint, false, time);
if (error != -1) {
  let accel = UtilEngine.matrixMultiply(A, f);
  accel = UtilEngine.vectorAdd(accel, b);
  if (!computeForces.checkForceAccel(1E-8, f, accel, joint)) {
    throw '';
  }
}
```

### Redundant Contacts

It can often happen that the set of contacts is **redundant** in that pushing on one
contact leads the algorithm to increase forces at other contacts in such a way that
the push at that contact is negated, leading to no change in acceleration at that
contact. This means that we cannot independently set the acceleration at that contact.

This shows up mathematically as the Acc matrix being 'poorly conditioned' or singular
if we were to add that contact to C, with some row being a linear combination of other
rows. (Condition number is a measure of how close a matrix is to being singular). Each
row of the matrix corresponds to a contact point. Another way to say the same thing is
that there is a linear combination of rows that equals the zero vector. Then any one
of those rows is 'redundant' (because it can be expressed as a linear combination of
other rows).

Simulations where redundant contacts show up include: the Pile simulation where a
pile of rectangular blocks is resting on each other in a corner on the ground; and the
DoNothingGrinder where the shuttle blocks are wedged between immoveable blocks.

### Deferred (Rejected) Contacts

We avoid adding redundant contacts to C, to keep the Acc matrix non-singular as long as
possible. When starting to drive a contact to zero acceleration, we first check to see
if adding this contact to C will make Acc singular. If so, we **defer**
(also called **reject**) the contact, so the contact goes on a **list of rejects**
(the `R` array) which are handled only after all other non-deferred contacts have been
treated, and then only if the acceleration at the deferred contact is large enough to
worry about.

For the normal non-deferred contacts we have a limit on the acceptable acceleration of
`SMALL_POSITIVE`; but for deferred contacts, we have a different larger limit on
the acceptable acceleration of 100 times that amount. Here 'acceptable' means whether
the overall solution is acceptable, so that the `compute_forces` method can indicate
success in its return value.

There are some other ways for a contact to be 'deferred' (or 'rejected'). One is
when moving a contact from NC to C. When that happens, we do the same kind of check of
whether the contact will make Acc singular, and if so we defer the contact.

Another way that a contact can be deferred is if we notice that a 'zero step' was
made repeatedly at the same contact. Often when a contact moves from NC to C, the step
size is close to zero because the contact had zero acceleration. This is OK, but if we
then notice that the contact moves back from C to NC with another zero size step, we
defer that contact because this can lead to an infinite loop. Note that there can be
intervening zero steps of other contacts; for example, contact A, then B, and then C
all move from NC to C with zero size steps, then A moves back from C to NC with a zero
step -- we would defer contact A. But if any other the intervening steps (for B and C)
were non-zero size then we would not defer contact A.

Note that we can only defer a contact when it has zero force on it in the solution
as calculated to date. This is because all contacts in C usually have some non-zero
force, and if you removed a contact from C without first reducing its force to zero
then the solution would no longer be balanced and the acceleration at other contacts
in C would no longer be zero and contacts in NC might have negative acceleration.
Therefore we can defer a contact `d` before starting to drive it to zero acceleration,
because it is not yet in C and has no force. But as soon as you start driving to zero,
you have committed to putting the contact `d` into C because each step increases the
force at `d`. We can defer any contact that is currently in NC because it has no force.
In the 'zero step' case, we can defer the contact that is in C only if it has zero
force on it.

### Order of Treating Contacts

The order in which we handle (or 'treat') contacts is important and can affect what
solution is found. The policy is set via the {@link setNextContactPolicy}
method. The default policy is {@link NextContactPolicy.HYBRID} which first treats
Joints in random order, and then non-Joints in the order defined by which has the most
negative acceleration.

There are three other contact order policies: {@link NextContactPolicy.MIN_ACCEL},
{@link NextContactPolicy.RANDOM}, {@link NextContactPolicy.PRE_ORDERED}. Some of these
are used for testing.

### Infinite Loop Detection

There is a mechanism to detect infinite loops where a series of contacts keeps being
rejected over and over. Part of the mechanism looks at whether any progress was made in
the latest step by seeing if the acceleration at the contacts has changed.

The details of the infinite loop detection are as follows: There is a second 'reRejects'
list which contains twice-rejected contacts. If we try to treat a reject, but then
reject it again, it goes into the reRejects list and is removed from the rejects list.
When any progress is made, the reRejects go back to the rejects list to be treated
again. If the rejects list is exhausted without making any progress, then an infinite
loop is detected, then we abandon the entire process, returning an error code. It is
then up to the caller to decide if the resulting solution is adequate or not.

### Sometimes Acc Becomes Singular

Despite the effort to keep Acc non-singular, we sometimes need to treat a contact that
will make Acc singular because the contact has acceleration that is unacceptably large.
In most cases this 'unacceptably large' acceleration is actually very small, like 1E-8
where the limit is 1E-10.

This algorithm is able to still find a solution when Acc is
singular, but then the forces can **become unreasonably large** in order to drive the
acceleration to a small value. What seems to often happen is the following: we are
driving contact `d` to zero even though it makes Acc singular (if `d` were added to C) –
this happens when we are treating a previously deferred contact, and is towards the end
of the process when all non-deferred contacts are in the solution. What usually happens
is that some other contact immediately moves from C to NC and then the `Acc+d` matrix
becomes non-singular, which is a good result.

This algorithm is able to find a solution as long as the `b` vector is in the column
space of the A matrix. This shows up in two places: first, we use a method of solving
the matrix problem `A x = b` that can deal with a singular matrix like this. Second, we
will see that when trying to drive a 'redundant' contact to zero acceleration that the
`delta_a` (the change in acceleration from applying force at the contact) is zero;
normally this means that we cannot drive that contact to zero acceleration and would
fail; but instead it typically is the case that the total acceleration at that contact
is already zero (or close to zero) because we have driven the other contacts to zero,
and the redundant contact is dependent on those.

### Will Not Find Minimal Forces

This algorithm is not guaranteed to find the minimum set of forces that will satisfy the
constraints. Rather, the solution found (the set of forces) is sensitive to the order in
which contacts are treated.

See `myphysicslab.lab.engine2D.test.UtilEngine_test` for unit tests that use random
contact orderings; those tests show that the maximum force and the length of the force
vector depends on the ordering, and also on the criteria for when a matrix is poorly
conditioned (which affects when we defer treating a contact that would make the Acc
matrix poorly conditioned).

### Performance Tweaks

ComputeForces keeps a matrix allocated that is reused, to avoid re-allocating a large
matrix which seems to be a performance bottleneck. Some of the matrix algorithms were
modified so that the matrix can be over-sized. Also we reuse several vectors between
calls to `compute_forces`, to avoid reallocation.

This resulted in an 11% reduction in running time for the `pile_20_random_blocks`
performance test.

### Future Improvements

See [Future Improvements](../Engine2D.html#futureimprovements) in 2D Physics Engine
Overview.

### Remaining Mysteries

There are two remaining 'math mysteries' in `compute_forces`:

1. When we go to drive a redundant contact `d` to zero, it pushes a contact from C to
NC, so that `d` can be added and Acc stays non-singular. Is that guaranteed somehow?

2. When unreasonably large forces are calculated, it looks like it’s usually because
there is a pair of opposed contacts and somehow choosing the order so that these are
treated close together (in the sequence of which contact to treat when) is what causes a
large force to occur. Is there a way to recognize this and avoid it? Perhaps the two
contacts are close to linearly dependent? Or maybe adding the second makes the condition
of Acc bad?

*/
export class ComputeForces {
  /** name of this ComputeForces instance, for debugging only */
  private name_: string;
  /** Order in which contacts were treated; each entry is index of contact in A matrix,
  * for debugging only.
  */
  private order: number[] = [];
  /** Order in which to treat contacts; each entry is index of contact in A matrix,
  * when the {@link NextContactPolicy.PRE_ORDERED} policy is used.
  */
  private preOrder: number[] = [];
  /** The next contact policy to use for deciding order in which to treat contacts.
  */
  private nextContactPolicy: NextContactPolicy = NextContactPolicy.HYBRID;
  /** pseudo random number generator, used to randomly decide order in which to
  * calculate forces
  */
  private pRNG: Random;

/**
* @param name for debugging, this distinguishes whether this is used for
*     contact forces or collision impulses
* @param pRNG  pseudo random number generator, used to
*    randomly decide order in which to calculate forces
*/
constructor(name: string, pRNG: Random) {
  this.name_ = name;
  this.pRNG = pRNG;
}

/** Sets the policy for choosing which contact to treat next.
@param nextContactPolicy
@param preOrder Order in which to treat contacts; each entry is
    index of contact in A matrix. Used only with `NextContactPolicy.PRE_ORDERED`.
*/
setNextContactPolicy(nextContactPolicy: NextContactPolicy, preOrder?: number[]) {
  if (nextContactPolicy == NextContactPolicy.PRE_ORDERED) {
    if (Array.isArray(preOrder)) {
      this.preOrder = preOrder;
    } else {
      throw 'no preOrder specified';
    }
  } else {
    this.preOrder.length = 0;
  }
  this.nextContactPolicy = nextContactPolicy;
}

/** Returns the policy for choosing which contact to treat next.
*/
getNextContactPolicy(): NextContactPolicy {
  return this.nextContactPolicy;
}

/** Returns order in which contacts were treated; each entry is index of contact in
the A matrix.
*/
getOrder(): number[] {
  return Array.from(this.order);
}

/** Calculates the forces at each contact point of a multi-body contact situation. Can
also be used to find impulse needed at each collision point in a multi-body collision.

@param A an n x n matrix giving change in acceleration for force at each contact
@param f force at each contact (vector, length n), this is what is
    solved for and is returned via this array (this array is zeroed out at start).
@param b external and inertial forces in the system (vector, length n)
@param joint indicates which contacts are Joints (vector, length n)
@param debugCF true shows debugging messages
@param time  the current simulation time, used only for debugging
@param tolerance the tolerance to use for checking the results. If not
    provided, then no check is done.
@return error code, -1 if successful otherwise an error occurred
*/
compute_forces(A: Float64Array[], f: number[], b: number[], joint: boolean[], debugCF: boolean, time: number, tolerance?: number): number {
  /*if (Util.DEBUG && 1==0 && this.name_ == 'C' && this.pRNG.nextFloat() < 0.001) {
    // test of the ContactSim.reportError mechanism: randomly generate an error
    return -999;
  }*/
  // n = number of contacts
  const n = b.length;
  if (A.length != n || A[0].length != n || f.length != n || b.length != n ||
      joint.length != n) {
    throw 'wrong length of input array';
  }
  // short cut when n==1, (comes up a lot with serial collision handling)
  if (n==1) {
    f[0] = (joint[0] || b[0] < 0) ? -b[0]/A[0][0] : 0;
    return -1;
  }
  // SMALL_POSITIVE is used to decide when numbers are equal or zero
  const SMALL_POSITIVE = 1E-10;
  const WARNINGS = true; // Print warnings about unusual conditions
  const DEFER_SINGULAR = true; // Avoid making Acc matrix singular
  // SINGULAR_MATRIX_LIMIT specifies min size of diagonal elements in Acc
  // for Acc to be singular
  const SINGULAR_MATRIX_LIMIT = 2E-3;
  /* avoid re-allocating large matrix by re-using this. */
  let aMatrix: Float64Array[] = [];
  /* acceleration at each point.  a > 0 means separation. */
  const a: number[] = Util.newNumberArray(n);
  /* Contact points with non-zero contact force and zero acceleration */
  const C: boolean[] = Util.newBooleanArray(n);
  /* Non-Contact points that are separating, so contact force is zero.  */
  const NC: boolean[] = Util.newBooleanArray(n);
  /* Rejects list. Contacts that have been rejected by drive-to-zero */
  const R: boolean[] = Util.newBooleanArray(n);
  /* twice-rejected rejects.
  * reRejects allows us to select which reject to handle from rejects list,
  * without looking at any twice-rejected rejects.
  */
  const reRejects: number[] = [];
  /* change in acceleration from increase of 1 at contact [d] */
  const delta_a: number[] = Util.newNumberArray(n);
  /* change in force from increase of 1 at contact [d] */
  const delta_f: number[] = Util.newNumberArray(n);
  /* contacts which recently took a zero sized step */
  const zeroSteps: boolean[] = Util.newBooleanArray(n);
  /* list of states for detecting loops */
  const states: number[][] = [];
  /* for each state, the max square accel */
  const accels: number[] = [];

  /* note about the coding style here: The above constants were previously 
  * properties of the class, and the functions below were methods.
  * That resulted in every variable having a "this." prefix, which made the
  * code harder to read and seemed like wasteful property lookups.
  * Now all the functions are defined as constants here and the variables
  * are available in the closure.
  * However, there might be a performance hit because the functions here
  * are rebuilt by Javascript interpreter every time this executes.
  * See notes inside of lab/model/CollisionAdvance with some references
  * to websites that discuss this.
  */

  // size of step to take, calculated in maxStep
  let stepSize = 0;
  for (let i=0; i<n; i++) {
    f[i] = 0;
    a[i] = b[i];
    NC[i] = false;
    C[i] = false;
    R[i] = false;
  }

  /*
  * @param s
  */
  const print = (s: string): void => {
    if (Util.DEBUG) {
      console.log(this.name_+' '+Util.NF4(time)+' '+s);
    }
  }

  /*
  * @param s  preamble
  * @param printMatrix
  */
  const printEverything = (s: string, printMatrix?: boolean): void => {
    if (Util.DEBUG) {
      print('printEverything '+s);
      console.log('seed='+this.pRNG.getSeed());
      UtilEngine.printArray('f', f, Util.NFE, n);
      UtilEngine.printArray('a', a, Util.NFSCI, n);
      UtilEngine.printArray('delta_f', delta_f, Util.NFE, n);
      //UtilEngine.printArray('delta_f[C]', delta_f, n, C, Util.NFE);
      UtilEngine.printArray('delta_a', delta_a, Util.NFE, n);
      UtilEngine.printArrayIndices('joint', joint, n);
      UtilEngine.printArrayIndices('C', C, n);
      UtilEngine.printArrayIndices('NC', NC, n);
      UtilEngine.printArrayIndices('R', R, n);
      UtilEngine.printList('reRejects', reRejects);
      {
        const p = new Array(n);
        for (let i=0; i<n; i++) {
          p[i] = !C[i] && !NC[i] && !R[i];
        }
        UtilEngine.printArrayIndices('not treated', p, n);
      }
      if (printMatrix) {
        UtilEngine.printMatrix2('A '+A.length+'x'+A[0].length, A, Util.NFSCI);
        UtilEngine.printArray('b', b, Util.NFSCI, n);
      }
    }
  }

  /*
  * @param s  preamble
  * @param allInfo
  * @param j
  * @param d
  * @param loopCtr
  */
  const printContact = (s: string, allInfo: boolean, j: number, d: number, loopCtr: number): void => {
    if (Util.DEBUG) {
      s = s+' j='+j+' N='+n+' step='+Util.NFE(stepSize);
      if (allInfo || C[j]) {
          s += ' C['+j+']='+C[j]
            +' f['+j+']='+Util.NFE(f[j])
            +' delta_f['+j+']='+Util.NFE(delta_f[j]);
      }
      if (allInfo || NC[j]) {
          s += ' NC['+j+']='+NC[j]
            +' a['+j+']='+Util.NFE(a[j])
            +' delta_a['+j+']='+Util.NFE(delta_a[j]);
      }
      if (d >=0) {
        s += ' d='+d+' a[d]='+Util.NFE(a[d]);
      }
      if (loopCtr >= 0) {
        s += ' loopCtr='+loopCtr;
      }
      print(s);
    }
  }

  /* Resize the aMatrix to be at least N x N+1.
  * @param N  the size to make the matrix
  */
  const resizeMatrix = (N: number): Float64Array[] => {
    if (aMatrix.length < N) {
      // to avoid many re-allocates, bump up the size by larger increments
      N = 10 * (2 + N/10);
      aMatrix = new Array(N);
      for (let i=0; i<N; i++) {
        aMatrix[i] = new Float64Array(N+1);
      }
    }
    return aMatrix;
  }

  /* Detects infinite loop while solving reject contacts by checking if the current
  'state' is a duplicate of an earlier state. State is specified by the pattern of which
  contacts are in C, NC, or R, plus which contact is currently being driven-to-zero. We
  only track state once every contact has been treated, so that each contact is in one
  of C, NC, or R. We keep a list of every state seen previously.
  * @param d  which contact we are going to drive-to-zero next
  * @return true if the current state matches any previous state
  */
  const checkLoop = (d: number): boolean => {
    /* Returns the sum of squares of unwanted accelerations.  This should ideally
    be zero for a solution.
    @param accel  acceleration at each contact
    @param joint  true when contact is a Joint
    @param n number of contacts
    @return the sum of squares of unwanted accelerations
    */
    const sumAccelSquare = (accel: number[], joint: boolean[], n: number): number => {
      let r = 0;
      for (let i=0; i<n; i++) {
        if (joint[i] || accel[i] < 0) {
          r += accel[i]*accel[i];
        }
      }
      return r;
    }

    if (Util.DEBUG) {
      // check that only one of C, NC, or R are true
      for (let i=0; i<n; i++) {
        if (C[i])
          Util.assert(!NC[i] && !R[i]);
        if (NC[i])
          Util.assert(!C[i] && !R[i]);
        if (R[i])
          Util.assert(!C[i] && !NC[i]);
      }
    }
    // if any contact has not yet been treated, then no loop yet
    for (let i=0; i<n; i++) {
      if (!C[i] && !NC[i] && !R[i]) {
        if (debugCF) {
          print('contact not yet treated i='+i);
        }
        return false;
      }
    }
    if (Util.DEBUG && debugCF) {
      print('checkLoop states.length='+states.length);
    }
    // make a new state vector
    const state: number[] = [];
    for (let i=0; i<n; i++) {
      state.push(C[i] ? 1 : (NC[i] ? 2 : 3));
    }
    // also add the current contact being driven to zero to the state
    state.push(d);
    if (Util.DEBUG && debugCF) {
      UtilEngine.printList('checkLoop state', state);
    }
    // check whether this state vector already exists
    let duplicateState = false;
    for (let i=0, len=states.length; i<len; i++) {
      if (Util.DEBUG && debugCF) {
        UtilEngine.printList('state', state);
      }
      if (Util.equals(state, states[i])) {
        if (Util.DEBUG && WARNINGS) {
          const accelOld = accels[i];
          const accelMin = UtilEngine.minValue(accels);
          print('num states='+states.length
            +' now accel='+Util.NFE(sumAccelSquare(a, joint, n))
            +' prev accel='+Util.NFE(accelOld)
            +' min accel='+Util.NFE(accelMin)
            );
          UtilEngine.printList('state', state);
          console.log('checkLoop detected same state');
        }
        duplicateState = true;
      }
    }
    if (!duplicateState) {
      // add this new state to list of states
      states.push(state);
      accels.push(sumAccelSquare(a, joint, n));
    }
    if (duplicateState && Util.DEBUG && WARNINGS) {
      UtilEngine.printList('now state', state);
      states.map(s => UtilEngine.printList('old state', s));
      UtilEngine.printList('accels', accels);
    }
    return duplicateState;
  };

  /* Returns the contact with the most negative acceleration, except Joints are treated
  first in random order.

  We treat Joints first because they always need to be treated and will strongly
  affect the outcome of forces.

  It is important to treat Joints in random order to even out the 'neglect' of a
  Joint when it is consistently picked last and is deferred and so has more acceleration
  than the other Joints and winds up accumulating acceleration over time and moving
  significantly away resulting in a 'loose Joint'. This was seen when quickly spinning
  the two-connected-blocks (two blocks connected rigidly by two double Joints).

  When only 'rejects' (deferred contacts) are left, we pick the reject with most
  negative acceleration, but stop treating rejects when they have small negative
  acceleration.
  * @return the next contact to be treated
  */
  const nextContactHybrid = (): number => {
    //UtilEngine.printList('nextContact ', this.order);
    // for Joints, find the Joint with the maximum absolute value acceleration
    let j = -1;
    const rand = this.pRNG.randomInts(n);
    // Joints first, in random order
    for (let k=0; k<n; k++) {
      let i = rand[k];
      if (joint[i] && !C[i] && !NC[i] && !R[i]) {
        return i;
      }
    }
    // find the non-Joint with most negative accel
    let minAccel = Infinity;
    j = -1;
    for (let i=0; i<n; i++) {
      if (!joint[i] && !C[i] && !NC[i] && !R[i]) {
        if (a[i] < minAccel) {
          minAccel = a[i];
          j = i;
        }
      }
    }
    if (j > -1) {
      return j;
    }
    return nextReject();
  }

  /* Returns the contact with the most negative acceleration, treating Joints first.
  When only 'rejects' (deferred contacts) are left, we pick the reject with most
  negative acceleration, but stop treating rejects when they have small negative
  acceleration.

  We treat Joints first because they always need to be treated and will strongly
  affect the outcome of forces.
  * @return the next contact to be treated
  */
  const nextContactMinAccel = (): number => {
    //UtilEngine.printList('nextContact ', this.order);
    // for Joints, find the Joint with the maximum absolute value acceleration
    let maxAccel = -1;
    let j = -1;
    for (let i=0; i<n; i++) {
      if (joint[i] && !C[i] && !NC[i] && !R[i]) {
        if (Math.abs(a[i]) > maxAccel) {
          maxAccel = Math.abs(a[i]);
          j = i;
        }
      }
    }
    if (j > -1) {
      return j;
    }
    // for non-Joints find the non-Joint with most negative accel
    let minAccel = Infinity;
    j = -1;
    for (let i=0; i<n; i++) {
      if (!joint[i] && !C[i] && !NC[i] && !R[i]) {
        if (a[i] < minAccel) {
          minAccel = a[i];
          j = i;
        }
      }
    }
    if (j > -1) {
      return j;
    }
    return nextReject();
  }

  /* Returns contacts in random order, but treats Joints first.  This is used
  for testing.

  From several tests in UtilityTest, it seems that the random contact policy is still
  finding big forces, even with the “don’t make Acc be singular” policy. This means that
  treating contacts in order of their acceleration (most negative accel first), instead
  of randomly, is important.
  * @return the next contact to be treated
  */
  const nextContactRandom = (): number => {
    //UtilEngine.printList('nextContactRandom ', this.order);
    const rand = this.pRNG.randomInts(n);
    // Joints first
    for (let k=0; k<n; k++) {
      let i = rand[k];
      if (joint[i] && !C[i] && !NC[i] && !R[i]) {
        return i;
      }
    }
    // non-Joints
    for (let k=0; k<n; k++) {
      let i = rand[k];
      if (!joint[i] && !C[i] && !NC[i] && !R[i]) {
        return i;
      }
    }
    return nextReject();
  }

  /* Returns contacts according to a pre-arranged ordering given by the 'preOrder' list
  of contact numbers, but treats Joints first.  Used for testing.
  * @return the next contact to be treated
  */
  const nextContactOrdered = (): number => {
    //UtilEngine.printList('nextContactOrdered ', this.order);
    const np = this.preOrder.length;
    for (let k=0; k<np; k++) {
      let i = this.preOrder[k];
      if (joint[i] && !C[i] && !NC[i] && !R[i]) {
        return i;
      }
    }
    for (let k=0; k<np; k++) {
      let i = this.preOrder[k];
      if (!joint[i] && !C[i] && !NC[i] && !R[i] ) {
        return i;
      }
    }
    return nextReject();
  }

  /* Return the next deferred contact to be processed: the one with most negative
  acceleration, or for Joints the one with the largest absolute value acceleration.
  Will not return a contact on the 'reRejects' list, to allow cycling thru all of the
  rejects.
  * @return the next reject to be treated
  */
  const nextReject = (): number => {
    let maxAccel = 0.0;
    let j = -1;
    for (let i=0; i<n; i++) {
      if (R[i] && !reRejects.includes(i)) {
        if (!joint[i] && a[i] < -maxAccel || joint[i]
              && Math.abs(a[i]) > maxAccel) {
          maxAccel = Math.abs(a[i]);
          j = i;
        }
      }
    }
    // treat rejects only if they have significant acceleration
    if (j > -1 && maxAccel > 100*SMALL_POSITIVE) {
      return j;
    }
    return -1;
  }

  /* Check that acceleration at each contact is non-negative.
  @param tolerance tolerance used for testing whether acceleration is
      non-negative
  @return true if acceleration is OK
  */
  const checkAccel = (tolerance: number): boolean => {
    if (WARNINGS && Util.DEBUG) {
      for (let i=0; i<n; i++) {
        if ((C[i] || joint[i]) && Math.abs(a[i]) > SMALL_POSITIVE) {
          print('=======  accel s/b zero a['+i+']='
                +Util.NFE(a[i])+' tol='+Util.NFE(SMALL_POSITIVE));
        }
        if ((NC[i] && !joint[i]) && a[i] < -SMALL_POSITIVE) {
          print('========  accel s/b non-negative a['+i+']='
                +Util.NFE(a[i])+' tol='+Util.NFE(-SMALL_POSITIVE));
        }
        if (NC[i] && Math.abs(f[i]) > SMALL_POSITIVE) {
          print('========  force s/b zero at NC f['+i+']='
                +Util.NFE(f[i])+' tol='+Util.NFE(SMALL_POSITIVE));
        }
      }
      /*if (0 == 1 && Util.DEBUG) {
        let accel = UtilEngine.matrixMultiply(A, f);
        accel = UtilEngine.vectorAdd(accel, b);
        const minAccel2 = UtilEngine.minValue(accel);
        //Util.assert(Math.abs(minAccel) < 2E-8);
        const minAccel = UtilEngine.minValue(a, n);
        print('min accel = '+Util.NFE(minAccel)
            +' min accel2 = '+Util.NFE(minAccel2)
        );
        printEverything('checkAccel', true);
      }*/
      /*if (0 == 1 && Util.DEBUG) {
        UtilEngine.printArrayIndices('C', C, n);
        UtilEngine.printArrayIndices('NC', NC, n);
        UtilEngine.printArrayIndices('R', R, n);
        //UtilEngine.printList('rejects', rejects);
        const p = new Array(n);
        for (let i=0; i<n; i++) {
          p[i] = !C[i] && !NC[i];
        }
        UtilEngine.printArrayIndices('not C or NC', p, n);
      }*/
    }
    if (!ComputeForces.checkForceAccel(tolerance, f, a, joint)) {
      if (WARNINGS && Util.DEBUG) {
        print('checkForceAccel FAILED with tolerance='+Util.NFE(tolerance));
        UtilEngine.printArray('force', f, Util.NFE, n);
        UtilEngine.printArray('accel', a, Util.NFE, n);
      }
      return false;
    }
    return true;
  }

  /* Finds the largest step of force change we can take while driving contact d to have
  zero acceleration before causing a contact (other than d) to change between clamped
  contacts in C and unclamped contacts in NC. If we haven't yet treated a contact, then
  it is neither C nor NC.

  A Joint will not limit a step because it can have positive or negative force. Step
  size can be negative when d is a Joint with positive acceleration.

  @param d  index of the contact we are driving to zero acceleration
  @return the index of the contact that limited the step size;
        and also sets stepSize as a side-effect
  */
  const maxStep = (d: number): number => {
    let s = Infinity;
    // for a Joint d with positive acceleration, need to decrease the force f[d],
    // so we will have negative step size in this case.
    if (joint[d] && a[d] > 0) {
      s = Number.NEGATIVE_INFINITY;
    }
    let j = -1;
    //  d is the contact whose acceleration we are trying to drive to zero.
    //  d is neither in C nor NC.
    Util.assert(!C[d] && !NC[d]);
    //  Figure the stepsize that would drive the acceleration to zero at contact d.
    if (joint[d]) {
      j = d;
      s = -a[d]/delta_a[d];
    } else if (delta_a[d] > 0) { // was 1E-14
      // The acceleration must be negative, otherwise we would not still be driving
      // it to zero.
      // It is OK if delta_a[d] is tiny, that will result in a huge step,
      // which will likely be limited by other contacts.
      Util.assert(a[d] < -SMALL_POSITIVE);
      j = d;
      s = -a[d]/delta_a[d];
    } else {
      // We want to increase the force at [d], even though it doesn’t fix
      // the negative acceleration at [d] (in fact it makes it worse because
      // delta_a[d] < 0), and so we will push at [d] enough to get some other
      // contact to flip between C/NC, and then try again.
      // Typically what happens is we take a nearly zero size step so that some
      // other contact flips between C/NC, and then after that delta_a[d] > 0.
      /*if (0 == 1 && Math.abs(delta_a[d]) > SMALL_POSITIVE*1000) {
        printContact(' large delta_a[d]', true, d, d, -1);
        debugCF = true;
      }*/
    }
    if (debugCF && Util.DEBUG) {
      print('maxStep start with d='+d+' j='+j+' s='+Util.NFE(s));
      //printEverything('maxStep start');
    }
    // When sign = 1, we are increasing the negative a[d] to zero.
    // When sign = -1, we are decreasing the positive a[d] to zero.
    // sign is usually 1, except at Joints when it can be -1.
    const sign = s > 0 ? 1 : -1;
    // If i element of C, we can reduce the force there, but only to zero.
    // Then i will move over to NC.
    // Except a Joint has no limit on the force, positive or negative,
    // so Joints always stay in C, and never limit a step size.
    for (let i=0; i<n; i++) {
      if (!joint[i] && C[i] && delta_f[i]*sign < -1E-14) {
        let sPrime = -f[i]/delta_f[i];  // how much we can decrease f[i] by
        if (sPrime*sign < 0) {
          // Due to numerical inaccuracy, the force is slightly negative
          // so we take a zero size step to switch the contact from C to NC.
          if (Math.abs(f[i]) > 2*SMALL_POSITIVE) {
            debugCF = true;
          }
          if (debugCF && Util.DEBUG) {
            print('opposite step(1) i='+i
              +' '+Util.NFE(sPrime)
              +' delta_f[i]='+Util.NFE(delta_f[i])
              +' f[i]='+Util.NFE(f[i]));
          }
          sPrime = 0;
        }
        if (debugCF && Util.DEBUG) {
          print('C['+i+'] sPrime='+Util.NFE(sPrime));
        }
        if (sPrime*sign < s*sign) {
          // if smaller step, then adopt it as our current winner
          s = sPrime;
          j = i;
        }
      }
    }
    // If i element of NC, we can decrease the acceleration there, but only to zero.
    // Then i will move over to C.
    // For a Joint in NC, any change in acceleration pushes it into C.
    for (let i=0; i<n; i++) {
      if (NC[i] && (!joint[i] && delta_a[i]*sign < -1E-14
                  || joint[i] && Math.abs(delta_a[i]*sign) > 1E-14)) {
        let sPrime = -a[i]/delta_a[i];  // how much we can decrease f[i] by
        if (sPrime*sign < 0) {
          // Due to numerical inaccuracy, the accel is slightly negative
          // so we take a zero size step to switch the contact from NC to C.
          // (I got -1.000075E-10 here once).
          if (Math.abs(a[i]) > 2*SMALL_POSITIVE) {
            debugCF = true;
            printContact('opposite step(2)', true, i, d, -1);
          }
          if (debugCF && Util.DEBUG) {
            print('opposite step(2) i='+i
              +' sPrime='+Util.NFE(sPrime)
              +' delta_a[i]='+Util.NFE(delta_a[i])
              +' a[i]='+Util.NFE(a[i]));
          }
          sPrime = 0;
        }
        if (debugCF && Util.DEBUG) {
          print('NC['+i+'] sPrime='+Util.NFE(sPrime));
        }
        if (sPrime*sign < s*sign) {
          s = sPrime;
          j = i;
        }
      }
    }
    if (debugCF && Util.DEBUG) {
      print('maxStep end with j='+j+' d='+d+' s='+Util.NFE(s));
    }
    stepSize = s;
    return j;
  }

  /* fdirection computes vector delta_f resulting from a change of 1 in delta_f[d].
  We have a unit increase in the d-th force, so delta_f[d] = 1.
  The forces in NC remain zero, so delta_f[i] = 0, for i an element of NC.
  For i an element of C, we adjust those forces to maintain a[i] = 0.
  Essentially, we balance out the increase of the d-th force by adjusting
  all the C forces (this involves a matrix equation solve).
  <pre>
    Solves Acc delta_f = A[d]  to find the delta_f[i]
    which keeps delta_a[i] = 0 for all i in C, when applying delta_f[d] = 1.0.

    Let Acc = the sub-matrix of A consisting of only those rows/columns
    corresponding to contacts that are in C.
    Let A_d be the d-th column of A, but only for the rows that are in C.
    Note that d is not in C.
    Let x be delta_f, the vector of changes in force at contacts in C.
    If the force at the d-th contact is 1, then the change in acceleration
    at each element of C from that force is given by A_d.
    The total change in acceleration at each element of C is given by:
    Acc x + A_d
    Because we want this to be zero at each element of C:
    Acc x + A_d = 0
    Acc x = -A_d
    This the is matrix equation that we solve here.
  </pre>
  * @param d  index of the contact to drive to zero acceleration
  * @return -1 if successful, or an error code
  */
  const fdirection = (d: number): number => {
    for (let i=0; i<n; i++) {
      delta_f[i] = 0;
    }
    delta_f[d] = 1;
    Util.assert(!C[d]);
    const c = UtilEngine.countBoolean(C, n);  // number of elements in set C
    if (c > 0) {
      // Acc is an augmented matrix: the last column is for vector v1
      const Acc = resizeMatrix(c);
      for (let i=0, p=0; i<n; i++) {
        if (C[i]) {
          for (let j=0, q=0; j<n; j++)
            if (C[j]) {
              // Acc is the submatrix of A obtained by deleting the j-th row and
              // column of A for all j not in C
              Acc[p][q] = A[i][j];
              q++;
            }
          // The last column of Acc is where we put the vector v1 of the algorithm.
          // This is where the matrixSolve algorithm expects to find it.
          // v1 is the d-th column of A, but has only elements in C.
          Acc[p][c] = -A[i][d];
          p++;
        }
      }
      const x = Util.newNumberArray(c);
      // note that we put v1 into the last column of Acc earlier
      const nrow = Util.newNumberArray(c);
      // solves Acc x = v1
      const error = UtilEngine.matrixSolve3(Acc, x, /*tolerance=*/1E-9, nrow);
      if (WARNINGS && Util.DEBUG) {
        const singular = UtilEngine.matrixIsSingular(Acc, c, nrow,
            SINGULAR_MATRIX_LIMIT);
        if (singular) {
          // This can happen because we sometimes ignore the wouldBeSingular test
          // in drive_to_zero().
          print('Acc is singular in fdirection d='+d);
        }
      }
      if (error != -1) {
        Util.assert(false);
        return -999999;
      }
      // transfer x into delta_f
      for (let i=0, p=0; i<n; i++) {
        if (C[i]) {
          delta_f[i] = x[p++];
        }
      }
    }
    // matrix multiply to get the resulting delta_a from a change of 1 in delta_f[d]
    // this is:  delta_a = A delta_f
    for (let i=0; i<n; i++) {
      delta_a[i] = 0;
      for (let j=0; j<n; j++) {
        delta_a[i] += A[i][j]*delta_f[j];
      }
    }
    return -1;
  }

  /* For the Acc matrix formed by adding contact d into set C, returns true if that
  * matrix is singular. Does Gaussian Elimination on the extended Acc matrix, and if
  * the last row is zero at the end, then we know the matrix is singular.
  * @param d  index of the contact to be added to set C
  * @return true if matrix is singular after adding contact d
  */
  const wouldBeSingular1 = (d: number): boolean => {
    // Set up the matrix Acc as though d is in C, and solve a sample problem but
    // only to get the matrix in upper triangular form, so that we can
    // calculate the condition number of the matrix Acc.
    Util.assert(!C[d]);
    // c = 1 + number of elements in set C
    const c = 1 + UtilEngine.countBoolean(C, n);
    const Acc = resizeMatrix(c);
    for (let i=0, p=0; i<n; i++) {
      if (C[i] || i==d) {
        for (let j=0, q=0; j<n; j++) {
          if (C[j] || j==d) {
            // Acc is the submatrix of A obtained by deleting the j-th row and
            // column of A for all j not in C
            Acc[p][q] = A[i][j];
            q++;
          }
        }
        // The last column of Acc is where we put the vector v1 of the algorithm.
        // This is where the matrixSolve algorithm expects to find it.
        // We just put all 1's here, to avoid the algorithm complaining,
        // we don't care about this at all here.
        Acc[p][c] = 1;
        p++;
      }
    }
    const nrow = Util.newNumberArray(c);
    const x = Util.newNumberArray(c);
    const tolerance = 1E-9;
    const error = UtilEngine.matrixSolve3(Acc, x, tolerance, nrow); // solves Acc x = v1
    const isSingular = UtilEngine.matrixIsSingular(Acc, c, nrow,
        SINGULAR_MATRIX_LIMIT);
    if (debugCF && Util.DEBUG && (1 == 1 || isSingular)) {
      // print the matrix in triangular form after Gaussian Elimination
      const ncol = new Array(c+1);
      for (let i=0; i<c+1; i++) {
        ncol[i] = i;
      }
      UtilEngine.printMatrixPermutation('Acc '+c+'x'+(c+1), Acc, nrow, ncol, Util.NF7, c);
    }
    return isSingular;
  };

  /* For the Acc matrix formed by adding contacts d and e into set C, returns true if
  * that matrix is singular. Does Gaussian Elimination on the extended Acc matrix, and
  * if the last row is zero at the end, then we know the matrix is singular.
  * @param d  index of first contact to be added to set C
  * @param e  index of second contact to be added to set C
  * @return true if matrix is singular after adding contacts d, e
  */
  const wouldBeSingular2 = (d: number, e: number): boolean => {
    // Set up the matrix Acc as though d and k are in C, and solve a sample problem but
    // only to get the matrix in upper triangular form, so that we can
    // calculate the condition number of the matrix Acc.
    Util.assert(!C[d] && !C[e]);
    // c = 2 + number of elements in set C
    const c = 2 + UtilEngine.countBoolean(C, n);
    const Acc = resizeMatrix(c);
    for (let i=0, p=0; i<n; i++) {
      if (C[i] || i==d || i==e) {
        for (let j=0, q=0; j<n; j++)
          if (C[j] || j==d || j==e) {
            // Acc is the submatrix of A obtained by deleting the j-th row and
            // column of A for all j not in C
            Acc[p][q] = A[i][j];
            q++;
          }
        // The last column of Acc is where we put the vector v1 of the algorithm.
        // This is where the matrixSolve algorithm expects to find it.
        // We just put all 1's here, to avoid the algorithm complaining,
        // we don't care about this at all here.
        Acc[p][c] = 1;
        p++;
      }
    }
    const nrow = Util.newNumberArray(c);
    const x = Util.newNumberArray(c);
    const tolerance = 1E-9;
    const error = UtilEngine.matrixSolve3(Acc, x, tolerance, nrow); // solves Acc x = v1
    const isSingular = UtilEngine.matrixIsSingular(Acc, c, nrow,
        SINGULAR_MATRIX_LIMIT);
    if (debugCF && Util.DEBUG && isSingular) {
      // print the matrix in triangular form after Gaussian Elimination
      const ncol = new Array(c+1);
      for (let i=0; i<c+1; i++) {
        ncol[i] = i;
      }
      UtilEngine.printMatrixPermutation('Acc '+c+'x'+(c+1), Acc, nrow, ncol, Util.NF7, c);
    }
    return isSingular;
  };

  /*  drive_to_zero modifies forces until a[d] = 0.
  Drive_to_zero only modifies forces among C, NC or d; and d is then added to C or NC.

  If d is a non-Joint and a[d] &gt; 0;  then we put d into NC and we are done.
  If d is a non-Joint and a[d] &lt; 0;  then we increase f[d] until a[d] = 0.
  If d is a Joint and a[d] &gt; 0;  then we decrease f[d] until a[d] = 0.
  If d is a Joint and a[d] &lt; 0;  then we increase f[d] until a[d] = 0.

  But every change in f[d] causes changes in accelerations and forces at other contact
  points. Luckily it is a linear relationship, so we can find out that if we change
  f[d] by +1, how much do the forces at clamped contacts need to change to stay clamped
  (see fdirection).

  We increase f[d] in discrete steps. Without other constraints, we could choose f[d]
  to just exactly set a[d] = 0. However, applying that much force might cause one of
  the other contacts to clamp (move from NC to C) or un-clamp (move from C to NC).
  Therefore, we choose the largest step size (see maxStep) that takes us to either a[d]
  = 0 or to some contact other than d changing between C and NC. Then we repeat until
  we get a[d] = 0.

  Modifications of the algorithm for Joints:
  At a Joint, we want to keep acceleration at zero, but the force can be positive or
  negative. If we are driving the acceleration at a Joint to zero, then we may find
  that the step is negative (for example, we may start with a[d] &gt; 0, and need to
  decrease f[d] into the negative range to compensate). The maxStep function was
  modified to allow for finding negative step sizes. Also, Joints always stay in C,
  they never switch from C to NC, so they never limit a step size in maxStep (unless it
  is the Joint itself you are driving to zero, then the limit is because you want to
  get to a[d] = 0). Joints are called 'bilateral constraints' in the Baraff '94 paper,
  and this modification is described in section '4.5 Implementation Details'.

  Flip-flop contacts:
  It can happen that a contact causes multiple zero sized
  steps, where the state of the contact flip flops between C and NC
  without making any progress.  This can lead to an infinite loop.
  We take that contact out of both C and NC and defer treating it
  till after all other contacts have been driven to zero acceleration.

  Some key insights about the process:
  1)  Once we start driving d to zero, we are committed to having d in C (because every
      step applies more force at d).
  2)  The places to prevent making Acc singular are:
  2a) Before committing to driving d to zero. Check if matrix Acc+d is singular.
  2b) When moving a contact from NC to C.  In this case, check if the matrix Acc+d+j
      is singular.  Or if there is no force yet at d you could just check if Acc+j
      is singular.
  3)  We can only defer (reject) contacts that have zero force, otherwise the forces
      in C will no longer be balanced.  They become unbalanced in later steps when
      we are calculating delta_f based on Acc and there is a contact with force
      that is not in C.
  4)  Sometimes a step will both move a contact between C/NC and simultaneously
      drive a[d] to zero;  in that case we can end the process and move d to C.

  Some key understandings.  (These things are probably stated above already, but
  this is kind of my current mental model of the whole process.)
  1) f and a are always correct for ALL contacts, regardless of if in C or NC or
     neither. The acceleration can be independently calculated at every contact as:
        a = A f - b.
     However, what the algorithm does is:
        a = -b
        repeat until (constraints are met) {
          a = a + A . delta_f
          f = f + delta_f
        }
  2) We do matrix calculations with Acc instead of the full A matrix because f[i] = 0
     for i ∈ NC. We more-or-less ignore contacts in NC because they have no force.
  3) Any increase in force at d must be balanced by adjusting forces at other contacts
     in C.  This is the calculation of delta_f from
        Acc delta_f = -A[d]
     Because A[d] gives the amount that each contact's acceleration will change from an
     increase in force of 1.0 in f[d].
  4) In a drive_to_zero step, the focus is on driving the acceleration at d to zero;
     note that the acceleration at contacts in C do NOT change, they should all remain
     at zero acceleration. Contacts in NC can change acceleration as long as
     acceleration stays zero or positive (for non-Joints, or zero for Joints). These
     statements are captured by 'the constraints'.
  5) Transitions between C and NC happen because pushing at d either reduces the force
     at at contact in C or reduces the acceleration at a contact in NC.
  6) When the set C changes you have to recalculate delta_f before continuing to push
     more at d.
  7) You can only push at d (unless d is a Joint, then you can both pull and push).
     You are only driving d to zero if it has negative acceleration (or any accel
     for a Joint).  To counter negative acceleration at a contact, you naturally
     increase the contact force there which increases the accel.

  **TO DO**  fix documentation and remove code to reflect this no longer returns
      'index of contact we failed to drive to zero'.

  @param d  index of the contact to drive to zero acceleration
  @return -1 if success, otherwise positive integer gives index of
      contact to defer till later, or negative integer means general failure.
  */
  const drive_to_zero = (d: number): number => {
    Util.assert(n <= f.length);
    Util.assert(!C[d]);
    Util.assert(!NC[d]);
    if (debugCF && Util.DEBUG) {
      print('drive_to_zero d='+d+' a['+d+']='+Util.NFE(a[d])
        +' joint='+joint[d]+' N='+n);
    }
    // First deal with cases where we don't have to do anything at all
    // (no changes to forces needed) because a[d] is already at zero.
    // For non-Joints, when contact is separating, put contact into NC and done.
    // For Joints, if accel is zero, put into NC and done.
    if (!joint[d] && a[d] >= -SMALL_POSITIVE
        || joint[d] && Math.abs(a[d]) <= SMALL_POSITIVE) {
      NC[d] = true;
      return -1;
    }
    // We are now committing to moving d into C, because every non-zero step will
    // increase f[d].
    if (DEFER_SINGULAR) {
      // check whether adding d to C will make Acc+d matrix singular.
      if (wouldBeSingular1(d)) {
        if (!R[d]) {
          // defer d because adding d to C would make Acc+d matrix singular.
          if (Util.DEBUG && debugCF) {
            print('SINGULAR MATRIX(1) DEFER d='+d
                +' f[d]='+Util.NFE(f[d])
                +' a[d]='+Util.NFE(a[d]));
          }
          return d;
        } else {
          if (Util.DEBUG && debugCF) {
            // we won't defer d because we previously rejected it.
            print('SINGULAR MATRIX(1) IN REJECTS d='+d
                +' a[d]='+Util.NFE(a[d]));
          }
        }
      }
    }
    // We now know that contact d has acceleration which must be reduced to zero.
    for (let i=0; i<n; i++) {
      delta_a[i] = 0;
      delta_f[i] = 0;
      zeroSteps[i] = false;
    }
    let accelTol = SMALL_POSITIVE;
    let loopCtr = 0; // to detect infinite loops
    // for non-Joint:  ensure not accelerating into the contact
    // for Joint: ensure that acceleration is zero
    while (!joint[d] && a[d] < -accelTol ||
            joint[d] && Math.abs(a[d]) > accelTol) {
      if (debugCF && Util.DEBUG) {
        const accDsingular = wouldBeSingular1(d);
        print('Acc+d would be '+(accDsingular? '' : 'non-')+'singular, d='+d);
      }
      // fdirection computes the rest of delta_f resulting from delta_f[d] = 1
      const error = fdirection(d);
      if (error != -1)
        return error;
      if (debugCF && Util.DEBUG) {
        printEverything('drive_to_zero after fdirection, d='+d);
      }
      if (WARNINGS && Util.DEBUG) {
        for (let i=0; i<n; i++) {
          // check that delta_a[i] = 0 for all members of C
          if (C[i] && Math.abs(delta_a[i])> SMALL_POSITIVE) {
            print('should be zero '+' delta_a['+i+']='+Util.NFE(delta_a[i]));
          }
          // check that delta_f[i] is reasonable size;  defer if not??
          if (C[i] && Math.abs(delta_f[i]) > 1E6) {
            print('very large force '+' delta_f['+i+']='+Util.NFE(delta_f[i]));
          }
        }
      }
      // What is the maximum step we can take towards moving a[d] to zero,
      // before some contact other than d is clamped or unclamped?
      // maxStep returns the stepSize and the index j of the force that
      // limited the step.
      const j = maxStep(d);
      if (j<0 || Math.abs(stepSize) > 1E5) {
        // maxStep found a huge step, or cannot figure what to do.
        if (WARNINGS && Util.DEBUG) {
          if (j > -1) {
            print('HUGE STEP j='+j+' d='+d+' stepSize='+Util.NFE(stepSize));
          } else {
            print('maxStep:  no step possible d='+d);
          }
        }
        // Defer [d] if f[d] = 0;  else if a[d] ≈ 0 then move d to C;
        // otherwise it is a general error, which should not happen.
        if (Math.abs(f[d]) < SMALL_POSITIVE) {
          return d;
        } else {
          // If a[d] is near zero then we increase the tolerance for
          // acceleration.  This should cause d to move into C.
          if (Math.abs(a[d]) < 1E-5) {
            accelTol = 1.1 * Math.abs(a[d]);
            continue;
          }
          // f[d] has significant force, so we cannot defer it, because
          // d is not yet in C so we can no longer balance the forces.
          if (Util.DEBUG) {
            printEverything('maxStep failed but f[d]>0, d='+d+' j='+j, false);
          }
          // If this assert ever happens, we need to debug it.
          //Util.assert(false);
          return -2;  // general error, unable to drive d to zero accel
        }
      }
      Util.assert(j > -1);
      if (debugCF && Util.DEBUG) {
        printContact(' maxStep', false, j, d, loopCtr);
      }
      if (Math.abs(stepSize) < 1E-12) {
        // We are taking a zero size step;  ensure not happening repeatedly.
        if (debugCF && Util.DEBUG) {
          printContact(' ZERO STEP', false, j, d, loopCtr);
        }
        if (zeroSteps[j]) {
          // This contact has previously caused a zero-size step during this
          // drive-to-zero loop, so it is flip-flopping between C and NC,
          // potentially as an infinite loop.
          if (WARNINGS && Util.DEBUG) {
            print('FLIP-FLOP DEFER j='+j
              +' f[j]='+Util.NFE(f[j])
              +' a[j]='+Util.NFE(a[j])
              +' while driving d='+d+' N='+n);
          }
          // defer solving this contact by adding to rejects, then continue on
          Util.assert(Math.abs(f[j]) < 10*SMALL_POSITIVE);
          C[j] = false;
          NC[j] = false;
          R[j] = true;
        }
        // Remember that this contact caused a zero-size step.
        // This is OK to happen once in this drive-to-zero loop,
        // but multiple times can be a problem.
        zeroSteps[j] = true;
      }
      // apply the step in forces to modify the forces f and accelerations a.
      for (let i=0; i<n; i++) {
        f[i] += stepSize*delta_f[i];
        a[i] += stepSize*delta_a[i];
      }
      if (loopCtr++ > 10*n) {
        if (Util.DEBUG) {
          debugCF = true;
          print('drive_to_zero() loopCtr='+loopCtr+' d='+d+' a[d]='+a[d]);
        } else if (loopCtr > 1000*n) {
          throw 'drive_to_zero() loopCtr='+loopCtr+' d='+d+' a[d]='+a[d];
        }
      }
      if (DEFER_SINGULAR && NC[j]) {
        // because j is in NC, it must have zero force.
        Util.assert(Math.abs(f[j]) < SMALL_POSITIVE);
        // maxStep is asking to move j from NC to C,
        // check whether this will make Acc+d+j matrix singular.
        // (alternative:  if f[d] = 0, could instead check if Acc+j is singular)
        if (wouldBeSingular2(d, j)) {
          if (!R[j]) {
            // we will defer j because it would make Acc+d+j singular
            if (debugCF && Util.DEBUG) {
              print('SINGULAR MATRIX(2) DEFER NC j='+j
                  +' f[j]='+Util.NFE(f[j])+' a[j]='+Util.NFE(a[j]));
            }
            C[j] = false;
            NC[j] = false;
            R[j] = true;
            continue;
          } else {
            // we won't defer j because we previously rejected it.
            // This case doesn't seem to happen, and it is unclear what to do here.
            if (WARNINGS && Util.DEBUG) {
              print('SINGULAR MATRIX(2) IN REJECTS NC j='+j
                  +' a[j]='+Util.NFE(a[j]));
            }
          }
        }
      }
      // If j is in C or NC, j is moved from one to the other.
      // otherwise, j = d, meaning a[d] has been driven to zero,
      // and drive-to-zero returns.
      // We allow small negative numbers to be in the solution:
      // a small negative acceleration for contacts in C or
      // a small negative force for contacts in NC.
      // When the small negative accel or force exceeds a certain small limit,
      // then we move the contact into the 'not yet driven to zero' category
      // (out of C or NC and possibly into rejects) so that it can be again
      // driven-to-zero later on.
      if (C[j]) {
        // This is moving from C to NC, we've just reduced the force to near zero.
        Util.assert(Math.abs(f[j]) <= SMALL_POSITIVE);
        if (Math.abs(a[j]) > SMALL_POSITIVE) {
          // A contact in C, should have zero accel, but errors have
          // accumulated to give this a non-zero accel.
          // Instead of moving to NC, move this to the set of untreated contacts
          // so that we can drive it to zero again.
          if (Math.abs(f[j])> 10*SMALL_POSITIVE) {
            const s = 'moving C to NC but f[j]='+ Util.NFE(f[j]);
            if (Util.DEBUG) {
              printEverything(s);
            } else {
              throw s;
            }
          }
          if (WARNINGS && Util.DEBUG) {
            printContact(' redo C', false, j, d, loopCtr);
          }
          C[j] = false;
          NC[j] = false;
          R[j] = true;
        } else {
          C[j] = false;
          NC[j] = true;
          Util.assert(!R[j]);  // it was in C, so not in R
        }
      } else if (NC[j]) {
        Util.assert(Math.abs(a[j]) <= SMALL_POSITIVE);
        if (Math.abs(f[j]) > SMALL_POSITIVE) {
          // A contact in NC, should have zero force, but errors have
          // accumulated to give this a non-zero force.
          // Instead of moving to C, move this to the set of untreated contacts
          // so that we can drive it to zero again.
          // ??? SHOULD WE ADD THIS TO REJECTS???
          if (Math.abs(a[j])> 10*SMALL_POSITIVE) {
            print('WARNING moving NC to C but a[j]='+Util.NFE(a[j]));
          }
          if (WARNINGS && Util.DEBUG) {
            printContact(' redo NC', false, j, d, loopCtr);
          }
          C[j] = false;
          NC[j] = false;
          R[j] = true;
        } else {
          C[j] = true;
          NC[j] = false;
          Util.assert(!R[j]);  // it was in NC, so not in R
        }
      } else if (j == d) {
        // If j is not in C or NC, then j is the one we are driving to zero, ie. j = d
        // and maxStep would have chosen a large enough step to arrive at a[d] = 0.
        // which means we are done driving d to zero.
        // We continue the loop, which will end when a[d] = 0.
      } else {
        // when j is in neither C nor NC, then we just deferred it.
        Util.assert(R[j]);
        /*if (0 == 1 && WARNINGS && Util.DEBUG) {
          print('we probably just deferred something.  j='+j+' d='+d);
          printContact('we probably deferred', false, j, d, loopCtr);
        }*/
      }
    }
    // Decide whether to put d in C or NC based on force f[d]
    C[d] = Math.abs(f[d]) > SMALL_POSITIVE;
    NC[d] = !C[d];
    //R[d] = false;  don't do this here; done in loop outside
    // If we applied some force at f[d], it must be in C, otherwise in NC.
    Util.assert( (Math.abs(f[d]) > SMALL_POSITIVE && C[d])
          || (Math.abs(f[d]) <= SMALL_POSITIVE && NC[d]) );
    if (debugCF && Util.DEBUG) {
      print('drive_to_zero finish d='+d
        +' a['+d+']='+Util.NFE(a[d]));
      printEverything('drive_to_zero finish');
    }
    return -1;
  }




  // ===========. START OF ACTUAL compute_forces ==========================
  // When a contact is deferred by drive_to_zero, put it on list of rejects,
  // and then process other contacts, returning to the rejects at the end
  // to give them a second chance.
  let solved = 0;
  let loopCtr = 0;
  if (Util.DEBUG) {
    this.order = [];
  }
  if (Util.DEBUG && debugCF) {
    if (this.preOrder.length > 0) {
      UtilEngine.printList('preOrder ', this.preOrder);
    }
    printEverything('compute_forces start', true);
  }
  // while there exists d such that a[d] < 0
  while (true) {
    loopCtr++;
    let d = -1;
    switch (this.nextContactPolicy) {
      case NextContactPolicy.HYBRID:
        d = nextContactHybrid();
        break;
      case NextContactPolicy.MIN_ACCEL:
        d = nextContactMinAccel();
        break;
      case NextContactPolicy.RANDOM:
        d = nextContactRandom();
        break;
      case NextContactPolicy.PRE_ORDERED:
        d = nextContactOrdered();
        break;
      default: throw '';
    }
    if (Util.DEBUG && debugCF) {
      print('--------- in compute_forces, d='+d
        +' loopCtr='+loopCtr+' --------------');
    }
    if (d < 0) {
      break;
    }
    if (R[d]) {
      reRejects.push(d);
    }
    if (checkLoop(d)) {
      if (Util.DEBUG && WARNINGS) {
        print('checkLoop STOP');
      }
      break;
    }
    // keep track of the order of treating contacts, for debugging.
    if (Util.DEBUG) {
      this.order.push(d);
    }
    if (Util.DEBUG && loopCtr > 2*n) {
      debugCF = true;
      printEverything('compute_forces loopCtr= '+loopCtr+' d='+d, false);
    }
    const error = drive_to_zero(d);
    if (Util.DEBUG && debugCF) {
      print('drive_to_zero returned '+
          (error == -1 ? 'OK' : error) +' d='+d+' N='+n);
      //printEverything('after drive_to_zero('+d+')', false);
    }
    if (error > -1) {
      // Positive integer gives index of contact to defer till later.
      Util.assert(error < n);
      C[error] = false;
      NC[error] = false;
      R[error] = true;
      // indicate a deferral/reject with negative index.  For zero, use -9999.
      if (Util.DEBUG) {
        this.order.push(error == 0 ? -9999 : -error);
      }
    } else if (error < -1) {
      // negative error code (other than -1) means general failure
      if (Util.DEBUG && WARNINGS) {
        print('compute_forces general error '+error);
      }
      return error;
    } else {
      Util.assert(error == -1);
      // -1 means success, so remove d from rejects list (if it was on the list)
      // and reset the reRejects list.
      reRejects.length = 0;
      if (R[d]) {
        if (Util.DEBUG && debugCF) {
          printContact(' deferral solved ', true, d, -1, -1);
        }
        solved++;
        R[d] = false;
      }
    }
  }
  /*if (Util.DEBUG && 0 == 1) {
    UtilEngine.printArray2(Util.NF7(time)+' ComputeForces order ', this.order, Util.NF0);
  }*/
  if (Util.DEBUG && debugCF && solved > 0) {
    if (solved > 0) {
      print('compute_forces rejects solved '+solved);
    }
    printEverything('end of compute_forces');
  }
  if (tolerance !== undefined) {
    if (!checkAccel(tolerance)) {
      return -2;
    }
  }
  return -1;
}

/** Returns the maximum unwanted acceleration at all contacts.
@param accel  acceleration at each contact
@param joint  true when contact is a Joint
@param n number of contacts
@return the maximum unwanted acceleration at all contacts
*/
static maxAccel(accel: number[], joint: boolean[], n: number): number {
  let r = 0;
  for (let i=0; i<n; i++) {
    if (joint[i] || !joint[i] && accel[i] < 0) {
      if (Math.abs(accel[i]) > r)
        r = Math.abs(accel[i]);
    }
  }
  return r;
}

/** Returns true if the given force and accel vectors satisfy the constraints that
* if `f != 0` then `a = 0`, or if `f = 0` then `a >= 0`.
* @param tolerance ignore deviations from constraints smaller than this
* @param force array of forces applied to a set of contacts
* @param accel array of accelerations at a set of contacts
* @param joint whether each contact is a joint
* @return true if the force and accel vectors satisfy the constraints
*/
static checkForceAccel(tolerance: number, force: number[], accel: number[], joint: boolean[]): boolean {
  if (Util.DEBUG) {
    UtilEngine.checkArrayNaN(accel);
    UtilEngine.checkArrayNaN(force);
  }
  if (accel.length < force.length) {
    throw '';
  }
  let r = true;
  for (let i=0; i<force.length; i++) {
    if (joint[i] || Math.abs(force[i]) > 1E-10) {
      if (Math.abs(accel[i]) > tolerance) {
        r = false;
        if (Util.DEBUG) {
          console.log('checkForceAccel i='+i
              +' accel[i]='+Util.NFE(accel[i])
              +' force[i]='+Util.NFE(force[i]));
        }
      }
    } else {
      if (accel[i] < - tolerance) {
        r = false;
        if (Util.DEBUG) {
          console.log('checkForceAccel i='+i
              +' accel[i]='+Util.NFE(accel[i])
              +' force[i]='+Util.NFE(force[i]));
        }
      }
    }
  }
  return r;
};

} // end class

Util.defineGlobal('lab$engine2D$ComputeForces', ComputeForces);
