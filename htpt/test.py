import numpy as np
import matplotlib.pyplot as plt

a = np.arange(5)
fig, ax = plt.subplots()
ax.plot(a, a ** 2)
fig