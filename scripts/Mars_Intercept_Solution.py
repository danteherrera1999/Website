import numpy as np
import matplotlib.pyplot as plt
import scipy as sci
import scipy.integrate
from matplotlib.animation import FuncAnimation

# CONSTANTS
R_E = 1.496 * 10 ** 8 #km
R_M = 2.279 * 10 ** 8 #km
R_E *= 1000
R_M *= 1000
mu_s = 1.327 * 10 ** 11 # km^3/s^2
mu_s *= 1000 ** 3
alpha = 44.3292 #deg
alpha *= np.pi / 180


theta_12 = alpha
theta_2 = np.pi - theta_12
angle_to_rdv = np.pi - theta_12

# EARTH
a_e = R_E
T_e = (2 * np.pi) * np.sqrt( a_e ** 3 / mu_s)
w_e = 2 * np.pi / T_e
h_e = np.sqrt(2 * mu_s) * np.sqrt(a_e / 2)
v_e = h_e / a_e

# MARS
a_m = R_M
T_m = (2 * np.pi) * np.sqrt( a_m ** 3 / mu_s)
w_m = 2 * np.pi / T_m
h_m = np.sqrt(2 * mu_s) * np.sqrt(a_m / 2)
v_m = h_m / a_m


# Transfer

t_r = angle_to_rdv / w_m
T_tf = t_r * 2
a_tf = (( T_tf ** 2 * mu_s) / (4 * np.pi ** 2) ) ** ( 1 / 3)
r_tf_p = a_e
r_tf_a = a_m
h_tf = np.sqrt(2 * mu_s) * np.sqrt( ( r_tf_a * r_tf_p ) / ( r_tf_a + r_tf_p))
v_tf_p = h_tf / r_tf_p
v_tf_a = h_tf / r_tf_a

delta_v = v_tf_p - v_e
print(f"Delta V = {int(delta_v)/1000} km/s")

# PLOTTING
s = lambda theta: np.sin(theta)
c = lambda theta: np.cos(theta)
mars_to_inertial = np.array([[c(alpha),-s(alpha)],[s(alpha),c(alpha)]])

# INITIAL VECTORS [x,y]

# EARTH
p_e = np.array([0,-a_e])
v_e = np.array([v_e,0])


# MARS
# MARS FRAME
p_m = np.array([0,-a_m])
v_m = np.array([v_m,0])
# CONVERT TO INERTIAL FRAME
p_m = np.matmul(mars_to_inertial,p_m)
v_m = np.matmul(mars_to_inertial,v_m)


# SATELLITE
p_sat = np.array([0,-a_e])
v_sat = np.array([v_tf_p,0])

# SUN
p_sun = np.array([0,0])
v_sun = np.array([0,0])
def TwoBodyEquations(w,t):
    r1=w[:2]
    v1=w[2:]
    mag_r = np.sqrt(np.sum(r1 ** 2))
    dv1bydt = -mu_s * (r1 / mag_r ** 3)
    dr1bydt = v1

    derivs = np.concatenate((dr1bydt,dv1bydt))
    return derivs

# EARTH
init_params=np.array([p_e,v_e]).flatten() #create array of initial params
time_span=np.linspace(0,t_r,1000)

# Run the ODE solver
two_body_sol=sci.integrate.odeint(TwoBodyEquations,init_params,time_span)
x_e, y_e = two_body_sol.T[:2]
plt.plot(x_e,y_e,c="g",label="EARTH")

# MARS
init_params=np.array([p_m,v_m]).flatten() #create array of initial params

# Run the ODE solver
two_body_sol=sci.integrate.odeint(TwoBodyEquations,init_params,time_span)
x_m, y_m = two_body_sol.T[:2]
plt.plot(x_m, y_m,c="r",label="MARS")

# SATELLITE
init_params=np.array([p_sat,v_sat]).flatten() #create array of initial params

# Run the ODE solver
two_body_sol=sci.integrate.odeint(TwoBodyEquations,init_params,time_span)
x_s, y_s = two_body_sol.T[:2]
plt.plot(x_s, y_s,c="b",label="SATELLITE")

# STATIC PLOT
plt.plot([0],[0],"ro",c="orange")
plt.legend()
plt.title("Mars Transfer Orbit Plot")
plt.ylabel("Position (m)")
plt.xlabel("Position (m)")
b = 2.5 * 10 ** 11
plt.xlim(-b,b)
plt.ylim(-b,b)
#plt.savefig("Orbitalplot.png")

# DYNAMIC PLOT
plt.style.use('seaborn-pastel')
fig = plt.figure()
plt.plot([0],[0],"ro",c="orange")
ax = plt.axes(xlim=(0, 4), ylim=(-2, 2))
line, = ax.plot([], [], lw=3)
plt.xlim(-b,b)
plt.ylim(-b,b)
lines = []
plt.legend()

for index in range(3):
    lobj = ax.plot([],[],lw=2)[0]
    lines.append(lobj)

def init():
    for line in lines:
        line.set_data([],[])
    return lines

frms = 1000

def animate(i):
    xlist = [x_e[:i+1],x_s[:i+1],x_m[:i+1]]
    ylist = [y_e[:i+1],y_s[:i+1],y_m[:i+1]]
    for lnum,line in enumerate(lines):
        line.set_data(xlist[lnum], ylist[lnum]) # set data for each line
    return lines

anim = FuncAnimation(fig, animate, init_func=init,
                               frames=frms, interval=.001, blit=True)

plt.title("Animated Transfer Orbits")
plt.show()
#anim.save('orbits.gif', writer='imagemagick')