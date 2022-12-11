import numpy as np
import matplotlib.pyplot as plt

# ALL UNIT


#BUILD PM TABLES
gamma = 1.4
v_calcs = lambda M:  np.sqrt( (gamma + 1) / (gamma - 1) ) * np.arctan(np.sqrt( (gamma - 1) * (M **2 - 1) / (gamma + 1))) - np.arctan(np.sqrt(M**2 - 1))
mu = lambda M: np.arcsin(1/M)
Ms = np.linspace(1,5,10000)
vs = v_calcs(Ms)


def pm(**val):
    type, val = list(val.items())[0]
    if type == "M":
        i = np.argmin(abs(Ms-val))
        if Ms[i] > val:
            i-=1
        return ((vs[i+1] - vs[i])/(Ms[i+1] - Ms[i])) * (val-Ms[i]) + vs[i]
    elif type== "v":
        i = np.argmin(abs(vs-val))
        if vs[i] > val:
            i-=1
        return ((Ms[i+1] - Ms[i])/(vs[i+1] - vs[i])) * (val-vs[i]) + Ms[i]


# DEFINE
d2r = np.pi / 180
r2d = 180 / np.pi

#EXIT MACH
Me = 3

# Number of Characteristic lines
n_CL = 50

#number of characteristic points
n = np.sum(np.arange(1,n_CL+1))+n_CL

#Mach angle at exit
mu_e = mu(Me)

#Mach number at throat
Mt = 1.001

#Mach angle at throat
mu_t = np.arcsin(1/Mt)

theta_max = pm(M=Me) / 2
print(f"Theta_max: {int(100*theta_max*r2d)/100} degrees")

theta_0 = theta_max / n_CL
delta_theta = theta_max / n_CL


RR_CLs = []


#Point a
theta_a = theta_max
M_a = Mt
v_a = pm(M=M_a)
mu_a = mu_t
x_a = 0
y_a = 1

#Point 1
temp = []
theta_l = theta_0
v_l = theta_l
K_p_l = 0
K_m_l = theta_l + v_l
M_l = pm(v=v_l)
mu_l = mu(M_l)
s_m = np.tan(theta_l - mu_l)
x_l = -1/s_m
y_l = 0
temp.append([1,K_m_l ,K_p_l,theta_l,v_l,M_l,mu_l,x_l,y_l])

#BUILD FIRST RRCL
for i in range(n_CL-1):
    theta_l = theta_0 + delta_theta * (i+1)
    v_l = theta_l
    K_m_l = theta_l + v_l
    K_p_l = 0
    M_l = pm(v=v_l)
    mu_l = mu(M_l)
    s_L = np.tan(theta_l - mu_l)
    s_R = np.tan(.5 *( (theta_l + temp[i][3]) + (mu_l + temp[i][6]) ))
    x_l = (temp[i][8] - s_R * temp[i][7] - 1)/(s_L-s_R)
    y_l = 1 + s_L * x_l
    temp.append([i+2,K_m_l ,K_p_l,theta_l,v_l,M_l,mu_l,x_l,y_l])

#Build first Wall point
ig,K_m_l ,K_p_l,theta_l,v_l,M_l,mu_l,ig,ig = temp[-1]
s_W = np.tan(theta_max - .5 * theta_0)
s_R = np.tan(theta_l + mu_l)
x_l = (temp[-1][8] - s_R * temp[-1][7] - 1)/(s_W - s_R)
y_l = 1 + s_W * x_l
temp.append([n_CL+1,K_m_l ,K_p_l,theta_l,v_l,M_l,mu_l,x_l,y_l])
RR_CLs.append(np.array(temp))



#BUILD THE OTHER RRCLs
for i in range(n_CL-1):
    temp = []
    N_RR = np.sum(np.arange(n_CL-i+1,n_CL+2))+1
    #Centerline point
    theta_l = 0
    K_m_l = RR_CLs[i][1][1]
    K_p_l = 2 * theta_l - K_m_l
    v_l = .5 * (K_m_l - K_p_l)
    M_l = pm(v=v_l)
    mu_l = mu(M_l)
    s_L = np.tan(.5 * ( ( theta_l + RR_CLs[i][1][3] ) - ( mu_l + RR_CLs[i][1][6] ) ))
    x_l = (s_L * RR_CLs[i][1][7] - RR_CLs[i][1][8]) / s_L
    y_l = 0
    temp.append([N_RR, K_m_l, K_p_l, theta_l, v_l, M_l, mu_l, x_l, y_l])
    #Build rest of RRCL
    for z in range(n_CL-i-2):
        K_p_l = temp[z][2]
        K_m_l = RR_CLs[i][z+2][1]
        theta_l = .5 * (K_m_l + K_p_l)
        v_l = .5 * (K_m_l - K_p_l)
        M_l = pm(v=v_l)
        mu_l = mu(M_l)
        s_L = np.tan( .5 * (theta_l + RR_CLs[i][z+2][3] - mu_l - RR_CLs[i][z+2][6]))
        s_R = np.tan(.5 * (theta_l + temp[z][3] + mu_l + temp[z][6]))
        x_l = (temp[z][8] + s_L * RR_CLs[i][z+2][7] - s_R * temp[z][7] - RR_CLs[i][z+2][8])/(s_L-s_R)
        y_l = RR_CLs[i][z+2][8] + s_L * x_l - s_L * RR_CLs[i][z+2][7]
        temp.append([N_RR + z + 1, K_m_l, K_p_l, theta_l, v_l, M_l, mu_l, x_l, y_l])


    #BUILD WALL POINT
    ig, K_m_l, K_p_l, theta_l, v_l, M_l, mu_l, ig, ig = temp[-1]
    s_W = np.tan(.5 * (RR_CLs[i][-1][3] + ( theta_max - theta_0 - delta_theta * ( i + 1) ) ) )
    s_R = np.tan(theta_l + mu_l)
    x_l = (temp[-1][8] + s_W * RR_CLs[i][-1][7] - s_R * temp[-1][7] - RR_CLs[i][-1][8]) / (s_W - s_R)
    y_l = RR_CLs[i][-1][8] + s_W * x_l - s_W * RR_CLs[i][-1][7]
    temp.append([N_RR+n_CL-i-1, K_m_l, K_p_l, theta_l, v_l, M_l, mu_l, x_l, y_l])
    RR_CLs.append(np.array(temp))


#POST
plt.figure()
col = "red"
for i in range(len(RR_CLs[0])-1):
    plt.plot([RR_CLs[0][i][7],RR_CLs[0][i+1][7]],[RR_CLs[0][i][8],RR_CLs[0][i+1][8]],c=col)
    plt.plot([0, RR_CLs[0][i][7]], [1, RR_CLs[0][i][8]],c=col)
plt.plot([0, RR_CLs[0][-1][7]], [1, RR_CLs[0][-1][8]],c=col)

RR_CLs = np.array(RR_CLs)
for i in range(len(RR_CLs)):
    RR_CLs[i][0:,1:5] *= r2d
    RR_CLs[i][0:,6] *= r2d

for i in range(1,n_CL):
    for z in range(RR_CLs[i].shape[0]-1):
        plt.plot([RR_CLs[i][z][7],RR_CLs[i][z+1][7]],[RR_CLs[i][z][8],RR_CLs[i][z+1][8]],c=col)
        plt.plot([RR_CLs[i-1][z+1][7],RR_CLs[i][z][7]],[RR_CLs[i-1][z+1][8],RR_CLs[i][z][8]],c=col)
    plt.plot([RR_CLs[i-1][-1][7],RR_CLs[i][-1][7]],[RR_CLs[i-1][-1][8],RR_CLs[i][-1][8]],c=col)
plt.show()

#POSTPOST :p
#file = open(f"output_{n_CL}_{Me}.txt","w")
#file.writelines(",".join(["0","1"])+"\n")
#for RRCL in RR_CLs:
#    file.writelines(",".join(RRCL[-1,7:].astype(str).tolist())+"\n")